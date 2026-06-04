use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
};

use rusqlite::{params, Connection};
use thiserror::Error;

const MIGRATION_TABLE: &str = "__clear_migrations";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DatabaseKind {
    Sqlite,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationKind {
    Schema,
    Data,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MigrationFile {
    pub id: u64,
    pub kind: MigrationKind,
    pub name: String,
    pub path: PathBuf,
    pub sql: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppliedMigration {
    pub id: u64,
    pub kind: MigrationKind,
    pub name: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MigrationReport {
    pub applied: Vec<AppliedMigration>,
}

#[derive(Debug, Error)]
pub enum MigrationError {
    #[error("failed to read migration directory {path}")]
    ReadDir {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
    #[error("failed to read migration file {path}")]
    ReadFile {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
    #[error("invalid migration filename {file_name}")]
    InvalidFileName { file_name: String },
    #[error("invalid migration kind {kind} in {file_name}")]
    InvalidMigrationKind { kind: String, file_name: String },
    #[error("duplicate migration id {id} between {first} and {second}")]
    DuplicateId {
        id: u64,
        first: String,
        second: String,
    },
    #[error("unsupported database kind {0:?}")]
    UnsupportedDatabaseKind(DatabaseKind),
    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
}

pub trait MigrationSource {
    fn load(
        &self,
        database_kind: DatabaseKind,
        environment: &str,
    ) -> Result<Vec<MigrationFile>, MigrationError>;
}

#[derive(Debug, Clone)]
pub struct FsMigrationSource {
    root: PathBuf,
}

impl FsMigrationSource {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }
}

impl MigrationSource for FsMigrationSource {
    fn load(
        &self,
        database_kind: DatabaseKind,
        environment: &str,
    ) -> Result<Vec<MigrationFile>, MigrationError> {
        load_migration_plan_from_fs(&self.root, database_kind, environment)
    }
}

#[derive(Debug, Default, Clone, Copy)]
pub struct EmbeddedMigrationSource;

impl MigrationSource for EmbeddedMigrationSource {
    fn load(
        &self,
        database_kind: DatabaseKind,
        environment: &str,
    ) -> Result<Vec<MigrationFile>, MigrationError> {
        load_migration_plan_from_embedded(database_kind, environment)
    }
}

pub fn apply_sqlite_migrations<S: MigrationSource + ?Sized>(
    source: &S,
    database_path: impl AsRef<Path>,
    environment: &str,
) -> Result<MigrationReport, MigrationError> {
    let plan = source.load(DatabaseKind::Sqlite, environment)?;
    apply_plan(database_path, plan)
}

fn apply_plan(
    database_path: impl AsRef<Path>,
    plan: Vec<MigrationFile>,
) -> Result<MigrationReport, MigrationError> {
    let mut connection = Connection::open(database_path)?;

    connection.execute_batch(&format!(
        "CREATE TABLE IF NOT EXISTS {MIGRATION_TABLE} (
            id INTEGER PRIMARY KEY,
            kind TEXT NOT NULL,
            name TEXT NOT NULL,
            applied_at INTEGER NOT NULL
        );"
    ))?;

    let applied_ids = applied_migration_ids(&connection)?;
    let mut applied = Vec::new();

    for migration in plan {
        if applied_ids.contains(&migration.id) {
            continue;
        }

        let transaction = connection.transaction()?;
        transaction.execute_batch(&migration.sql)?;
        transaction.execute(
            &format!(
                "INSERT INTO {MIGRATION_TABLE} (id, kind, name, applied_at)
                VALUES (?1, ?2, ?3, strftime('%s', 'now'))"
            ),
            params![migration.id as i64, migration.kind.as_str(), migration.name],
        )?;
        transaction.commit()?;

        applied.push(AppliedMigration {
            id: migration.id,
            kind: migration.kind,
            name: migration.name,
        });
    }

    Ok(MigrationReport { applied })
}

fn load_migration_plan_from_fs(
    migrations_root: &Path,
    database_kind: DatabaseKind,
    environment: &str,
) -> Result<Vec<MigrationFile>, MigrationError> {
    match database_kind {
        DatabaseKind::Sqlite => {
            let mut migrations = Vec::new();

            for directory in [
                migrations_root.join("sqlite/common"),
                migrations_root.join("sqlite").join(environment),
            ] {
                migrations.extend(read_migration_directory(migrations_root, &directory)?);
            }

            normalize_migration_plan(migrations)
        }
    }
}

fn load_migration_plan_from_embedded(
    database_kind: DatabaseKind,
    environment: &str,
) -> Result<Vec<MigrationFile>, MigrationError> {
    match database_kind {
        DatabaseKind::Sqlite => {
            let migrations = generated::EMBEDDED_MIGRATIONS
                .iter()
                .filter(|record| {
                    record.database_kind == database_kind
                        && (record.environment == "common" || record.environment == environment)
                })
                .map(EmbeddedMigrationRecord::into_migration_file)
                .collect();

            normalize_migration_plan(migrations)
        }
    }
}

fn normalize_migration_plan(
    migrations: Vec<MigrationFile>,
) -> Result<Vec<MigrationFile>, MigrationError> {
    let mut plan = BTreeMap::<u64, MigrationFile>::new();

    for migration in migrations {
        let previous = plan.insert(migration.id, migration.clone());
        if let Some(previous) = previous {
            return Err(MigrationError::DuplicateId {
                id: migration.id,
                first: previous.path.display().to_string(),
                second: migration.path.display().to_string(),
            });
        }
    }

    Ok(plan.into_values().collect())
}

fn read_migration_directory(
    migrations_root: &Path,
    directory: &Path,
) -> Result<Vec<MigrationFile>, MigrationError> {
    if !directory.exists() {
        return Ok(Vec::new());
    }

    let mut migrations = Vec::new();

    for entry in fs::read_dir(directory).map_err(|source| MigrationError::ReadDir {
        path: directory.to_path_buf(),
        source,
    })? {
        let entry = entry.map_err(|source| MigrationError::ReadDir {
            path: directory.to_path_buf(),
            source,
        })?;

        if !entry
            .file_type()
            .map_err(|source| MigrationError::ReadDir {
                path: directory.to_path_buf(),
                source,
            })?
            .is_file()
        {
            continue;
        }

        let path = entry.path();
        let file_name = path.file_name().and_then(|value| value.to_str());
        if !file_name.is_some_and(|value| value.ends_with(".sql")) {
            continue;
        }

        migrations.push(parse_migration_file(migrations_root, path)?);
    }

    migrations.sort_by_key(|migration| migration.id);
    Ok(migrations)
}

fn parse_migration_file(
    migrations_root: &Path,
    path: PathBuf,
) -> Result<MigrationFile, MigrationError> {
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| MigrationError::InvalidFileName {
            file_name: path.display().to_string(),
        })?;

    let stem = file_name
        .strip_suffix(".sql")
        .ok_or_else(|| MigrationError::InvalidFileName {
            file_name: file_name.to_string(),
        })?;

    let (id_part, rest) = stem
        .split_once('_')
        .ok_or_else(|| MigrationError::InvalidFileName {
            file_name: file_name.to_string(),
        })?;

    let id = id_part
        .parse::<u64>()
        .map_err(|_| MigrationError::InvalidFileName {
            file_name: file_name.to_string(),
        })?;

    let (kind_part, name_part) =
        rest.split_once("__")
            .ok_or_else(|| MigrationError::InvalidFileName {
                file_name: file_name.to_string(),
            })?;

    let kind = match kind_part {
        "schema" => MigrationKind::Schema,
        "data" => MigrationKind::Data,
        other => {
            return Err(MigrationError::InvalidMigrationKind {
                kind: other.to_string(),
                file_name: file_name.to_string(),
            });
        }
    };

    if name_part.is_empty() {
        return Err(MigrationError::InvalidFileName {
            file_name: file_name.to_string(),
        });
    }

    let sql = fs::read_to_string(&path).map_err(|source| MigrationError::ReadFile {
        path: path.clone(),
        source,
    })?;

    Ok(MigrationFile {
        id,
        kind,
        name: name_part.to_string(),
        path: path
            .strip_prefix(migrations_root)
            .unwrap_or(&path)
            .to_path_buf(),
        sql,
    })
}

fn applied_migration_ids(connection: &Connection) -> Result<BTreeSet<u64>, MigrationError> {
    let mut statement = connection.prepare(&format!("SELECT id FROM {MIGRATION_TABLE}"))?;
    let rows = statement.query_map([], |row| row.get::<_, i64>(0))?;
    let mut ids = BTreeSet::new();

    for row in rows {
        ids.insert(row? as u64);
    }

    Ok(ids)
}

impl MigrationKind {
    fn as_str(self) -> &'static str {
        match self {
            MigrationKind::Schema => "schema",
            MigrationKind::Data => "data",
        }
    }
}

impl EmbeddedMigrationRecord {
    fn into_migration_file(&self) -> MigrationFile {
        MigrationFile {
            id: self.id,
            kind: self.kind,
            name: self.name.to_string(),
            path: PathBuf::from(self.path),
            sql: self.sql.to_string(),
        }
    }
}

mod generated {
    include!(concat!(env!("OUT_DIR"), "/embedded_migrations.rs"));
}

pub struct EmbeddedMigrationRecord {
    pub database_kind: DatabaseKind,
    pub environment: &'static str,
    pub id: u64,
    pub kind: MigrationKind,
    pub name: &'static str,
    pub path: &'static str,
    pub sql: &'static str,
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use tempfile::tempdir;

    use super::*;

    fn write_sql(path: &Path, sql: &str) {
        fs::write(path, sql).expect("write migration");
    }

    #[test]
    fn applies_sqlite_migrations_in_order_from_fs() {
        let temp = tempdir().expect("tempdir");
        let migrations_root = temp.path().join("migrations");
        let common = migrations_root.join("sqlite/common");
        let dev = migrations_root.join("sqlite/dev");
        fs::create_dir_all(&common).expect("common dir");
        fs::create_dir_all(&dev).expect("dev dir");

        write_sql(
            &common.join("0001_schema__bootstrap.sql"),
            "CREATE TABLE example (id INTEGER PRIMARY KEY, name TEXT NOT NULL);",
        );
        write_sql(
            &dev.join("0002_data__seed.sql"),
            "INSERT INTO example (id, name) VALUES (1, 'alpha');",
        );

        let db_path = temp.path().join("app.sqlite");
        let source = FsMigrationSource::new(&migrations_root);
        let report = apply_sqlite_migrations(&source, &db_path, "dev").expect("migrations");

        assert_eq!(report.applied.len(), 2);

        let connection = Connection::open(db_path).expect("open db");
        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM example", [], |row| row.get(0))
            .expect("count rows");
        assert_eq!(count, 1);
    }

    #[test]
    fn rejects_duplicate_ids_across_layers() {
        let temp = tempdir().expect("tempdir");
        let migrations_root = temp.path().join("migrations");
        let common = migrations_root.join("sqlite/common");
        let dev = migrations_root.join("sqlite/dev");
        fs::create_dir_all(&common).expect("common dir");
        fs::create_dir_all(&dev).expect("dev dir");

        write_sql(&common.join("0001_schema__bootstrap.sql"), "SELECT 1;");
        write_sql(&dev.join("0001_data__duplicate.sql"), "SELECT 1;");

        let source = FsMigrationSource::new(&migrations_root);
        let error = source
            .load(DatabaseKind::Sqlite, "dev")
            .expect_err("duplicate");

        assert!(matches!(error, MigrationError::DuplicateId { .. }));
    }

    #[test]
    fn embedded_source_matches_fs_source_on_repo_tree() {
        let migrations_root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../migrations");
        let fs_source = FsMigrationSource::new(&migrations_root);
        let embedded_source = EmbeddedMigrationSource;

        let fs_plan = fs_source
            .load(DatabaseKind::Sqlite, "dev")
            .expect("fs plan");
        let embedded_plan = embedded_source
            .load(DatabaseKind::Sqlite, "dev")
            .expect("embedded plan");

        assert_eq!(fs_plan, embedded_plan);
    }
}
