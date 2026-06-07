use std::{fs, path::PathBuf};

use clear_core::domain_error::DomainError;
use clear_migrator::{
    EmbeddedMigrationSource, MigrationError, MigrationReport, apply_sqlite_migrations,
};
use serde::Serialize;
use tauri::{AppHandle, Manager};

#[tauri::command]
fn bootstrap(app: AppHandle) -> Result<BootstrapResult, DomainError> {
    let report = apply_local_migrations(&app)?;

    log::info!(
        "local migrations applied (applied={})",
        report.applied.len()
    );

    Ok(BootstrapResult {
        runtime_profile: current_runtime_profile(),
    })
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
enum RuntimeKind {
    Tauri,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
enum RuntimeFormFactor {
    Desktop,
    Mobile,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeProfile {
    runtime: RuntimeKind,
    form_factor: RuntimeFormFactor,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
struct BootstrapResult {
    runtime_profile: RuntimeProfile,
}

fn current_runtime_profile() -> RuntimeProfile {
    RuntimeProfile {
        runtime: RuntimeKind::Tauri,
        form_factor: runtime_form_factor_for_mobile_cfg(cfg!(mobile)),
    }
}

fn runtime_form_factor_for_mobile_cfg(mobile: bool) -> RuntimeFormFactor {
    if mobile {
        RuntimeFormFactor::Mobile
    } else {
        RuntimeFormFactor::Desktop
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![bootstrap])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            tauri::WebviewWindowBuilder::from_config(app.handle(), &app.config().app.windows[0])?
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn apply_local_migrations(app: &AppHandle) -> Result<MigrationReport, DomainError> {
    let database_path = default_database_path(app)?;
    let database_env = default_database_env();
    let source = EmbeddedMigrationSource;

    apply_sqlite_migrations(&source, database_path, &database_env).map_err(map_migration_error)
}

fn default_database_path(app: &AppHandle) -> Result<PathBuf, DomainError> {
    let data_dir = app.path().app_data_dir().map_err(|error| {
        DomainError::unavailable(format!("Failed to resolve app data dir: {error}"))
    })?;

    fs::create_dir_all(&data_dir).map_err(|error| {
        DomainError::unavailable(format!(
            "Failed to create app data dir {}: {error}",
            data_dir.display()
        ))
    })?;

    Ok(data_dir.join("clear.sqlite"))
}

fn default_database_env() -> String {
    default_database_env_from(std::env::var("CLEAR_DB_ENV").ok())
}

fn default_database_env_from(raw_value: Option<String>) -> String {
    raw_value
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| String::from("dev"))
}

fn map_migration_error(error: MigrationError) -> DomainError {
    match error {
        MigrationError::ReadDir { path, source } => DomainError::unavailable(format!(
            "Failed to read migration directory {}: {source}",
            path.display()
        )),
        MigrationError::ReadFile { path, source } => DomainError::unavailable(format!(
            "Failed to read migration file {}: {source}",
            path.display()
        )),
        MigrationError::InvalidFileName { file_name } => {
            DomainError::unexpected(format!("Invalid migration filename {file_name}"))
        }
        MigrationError::InvalidMigrationKind { kind, file_name } => {
            DomainError::unexpected(format!("Invalid migration kind {kind} in {file_name}"))
        }
        MigrationError::DuplicateId { id, first, second } => DomainError::conflict(format!(
            "Duplicate migration id {id} between {first} and {second}"
        )),
        MigrationError::UnsupportedDatabaseKind(kind) => {
            DomainError::unexpected(format!("Unsupported database kind {kind:?}"))
        }
        MigrationError::Sqlite(error) => {
            let message = error.to_string();

            if message.contains("database is locked") || message.contains("database is busy") {
                DomainError::unavailable(message)
            } else {
                DomainError::unexpected(message)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use clear_core::domain_error::DomainErrorType;
    use clear_migrator::MigrationError;

    use super::{
        RuntimeFormFactor, RuntimeKind, current_runtime_profile, map_migration_error,
        runtime_form_factor_for_mobile_cfg,
    };

    #[test]
    fn maps_duplicate_migration_ids_to_conflict() {
        let error = map_migration_error(MigrationError::DuplicateId {
            id: 1,
            first: String::from("first.sql"),
            second: String::from("second.sql"),
        });

        assert_eq!(error.error_type, DomainErrorType::Conflict);
        assert!(!error.retryable);
        assert!(
            error
                .message
                .as_deref()
                .is_some_and(|message| message.contains("Duplicate migration id 1"))
        );
    }

    #[test]
    fn maps_read_errors_to_unavailable() {
        let error = map_migration_error(MigrationError::ReadFile {
            path: PathBuf::from("migrations/0001.sql"),
            source: std::io::Error::new(std::io::ErrorKind::Other, "disk unavailable"),
        });

        assert_eq!(error.error_type, DomainErrorType::Unavailable);
        assert!(error.retryable);
    }

    #[test]
    fn maps_mobile_cfg_to_runtime_form_factor() {
        assert_eq!(
            runtime_form_factor_for_mobile_cfg(false),
            RuntimeFormFactor::Desktop
        );
        assert_eq!(
            runtime_form_factor_for_mobile_cfg(true),
            RuntimeFormFactor::Mobile
        );
    }

    #[test]
    fn reports_tauri_runtime_profile() {
        let profile = current_runtime_profile();

        assert_eq!(profile.runtime, RuntimeKind::Tauri);
        assert_eq!(
            profile.form_factor,
            runtime_form_factor_for_mobile_cfg(cfg!(mobile))
        );
    }
}
