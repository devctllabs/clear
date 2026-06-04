use std::{
    env, fs,
    path::{Path, PathBuf},
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum MigrationKind {
    Schema,
    Data,
}

#[derive(Debug, Clone)]
struct EmbeddedMigration {
    id: u64,
    kind: MigrationKind,
    environment: String,
    path: String,
    absolute_path: String,
    name: String,
}

fn main() {
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("manifest dir"));
    let migrations_root = manifest_dir.join("../../migrations");
    let embedded = collect_migrations(&migrations_root);

    println!("cargo:rerun-if-changed={}", migrations_root.display());
    println!(
        "cargo:rerun-if-changed={}",
        migrations_root.join("sqlite").display()
    );

    for migration in &embedded {
        println!("cargo:rerun-if-changed={}", migration.absolute_path);
    }

    let out_dir = PathBuf::from(env::var("OUT_DIR").expect("out dir"));
    fs::write(out_dir.join("embedded_migrations.rs"), render(&embedded))
        .expect("write embedded migrations");
}

fn collect_migrations(migrations_root: &Path) -> Vec<EmbeddedMigration> {
    let sqlite_root = migrations_root.join("sqlite");
    let mut migrations = Vec::new();

    if !sqlite_root.exists() {
        return migrations;
    }

    for layer_dir in read_dirs(&sqlite_root) {
        if !layer_dir.is_dir() {
            continue;
        }

        let environment = layer_dir
            .file_name()
            .and_then(|value| value.to_str())
            .expect("layer directory name")
            .to_string();

        for file in read_dirs(&layer_dir) {
            if !file.is_file() {
                continue;
            }

            let file_name = file
                .file_name()
                .and_then(|value| value.to_str())
                .expect("file name");
            if !file_name.ends_with(".sql") {
                continue;
            }

            let (id, kind, name) = parse_migration_filename(file_name);
            migrations.push(EmbeddedMigration {
                id,
                kind,
                environment: environment.clone(),
                path: file
                    .strip_prefix(migrations_root)
                    .unwrap_or(&file)
                    .display()
                    .to_string(),
                absolute_path: file.display().to_string(),
                name,
            });
        }
    }

    migrations.sort_by(|left, right| {
        left.path
            .cmp(&right.path)
            .then(left.id.cmp(&right.id))
            .then(left.name.cmp(&right.name))
    });
    migrations
}

fn read_dirs(dir: &Path) -> Vec<PathBuf> {
    let mut entries = Vec::new();

    let Ok(read_dir) = fs::read_dir(dir) else {
        return entries;
    };

    for entry in read_dir.flatten() {
        entries.push(entry.path());
    }

    entries.sort();
    entries
}

fn parse_migration_filename(file_name: &str) -> (u64, MigrationKind, String) {
    let stem = file_name
        .strip_suffix(".sql")
        .expect("migration file extension");
    let (id_part, rest) = stem.split_once('_').expect("migration id");
    let id = id_part.parse::<u64>().expect("migration id integer");
    let (kind_part, name_part) = rest.split_once("__").expect("migration name separator");
    let kind = match kind_part {
        "schema" => MigrationKind::Schema,
        "data" => MigrationKind::Data,
        other => panic!("invalid migration kind: {other}"),
    };

    (id, kind, name_part.to_string())
}

fn render(migrations: &[EmbeddedMigration]) -> String {
    let mut output = String::new();
    output.push_str("use super::{DatabaseKind, EmbeddedMigrationRecord, MigrationKind};\n\n");
    output.push_str("pub(crate) const EMBEDDED_MIGRATIONS: &[EmbeddedMigrationRecord] = &[\n");

    for migration in migrations {
        let kind = match migration.kind {
            MigrationKind::Schema => "MigrationKind::Schema",
            MigrationKind::Data => "MigrationKind::Data",
        };
        output.push_str("    EmbeddedMigrationRecord {\n");
        output.push_str("        database_kind: DatabaseKind::Sqlite,\n");
        output.push_str(&format!(
            "        environment: {:?},\n",
            migration.environment
        ));
        output.push_str(&format!("        id: {},\n", migration.id));
        output.push_str(&format!("        kind: {kind},\n"));
        output.push_str(&format!("        name: {:?},\n", migration.name));
        output.push_str(&format!("        path: {:?},\n", migration.path));
        output.push_str(&format!(
            "        sql: include_str!({:?}),\n",
            migration.absolute_path
        ));
        output.push_str("    },\n");
    }

    output.push_str("];\n");
    output
}
