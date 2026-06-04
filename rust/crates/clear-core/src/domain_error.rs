use std::collections::BTreeMap;

use serde::Serialize;

pub type FieldErrors = BTreeMap<String, Vec<String>>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DomainErrorType {
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Timeout,
    Offline,
    Unavailable,
    Unexpected,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainError {
    #[serde(rename = "type")]
    pub error_type: DomainErrorType,
    pub message: String,
    pub retryable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_errors: Option<FieldErrors>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_id: Option<String>,
}

impl DomainError {
    pub fn validation(message: impl Into<String>, field_errors: FieldErrors) -> Self {
        Self {
            error_type: DomainErrorType::Validation,
            message: message.into(),
            retryable: false,
            field_errors: Some(field_errors),
            entity: None,
            entity_id: None,
        }
    }

    pub fn unauthorized(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Unauthorized, message, false)
    }

    pub fn forbidden(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Forbidden, message, false)
    }

    pub fn not_found(
        message: impl Into<String>,
        entity: Option<String>,
        entity_id: Option<String>,
    ) -> Self {
        Self {
            error_type: DomainErrorType::NotFound,
            message: message.into(),
            retryable: false,
            field_errors: None,
            entity,
            entity_id,
        }
    }

    pub fn conflict(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Conflict, message, false)
    }

    pub fn timeout(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Timeout, message, true)
    }

    pub fn offline(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Offline, message, true)
    }

    pub fn unavailable(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Unavailable, message, true)
    }

    pub fn unexpected(message: impl Into<String>) -> Self {
        Self::without_metadata(DomainErrorType::Unexpected, message, false)
    }

    fn without_metadata(
        error_type: DomainErrorType,
        message: impl Into<String>,
        retryable: bool,
    ) -> Self {
        Self {
            error_type,
            message: message.into(),
            retryable,
            field_errors: None,
            entity: None,
            entity_id: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{DomainError, DomainErrorType};

    #[test]
    fn serializes_validation_errors_using_the_ui_contract_shape() {
        let error = DomainError::validation(
            "Invalid input.",
            [(
                String::from("email"),
                vec![String::from("Email is required.")],
            )]
            .into_iter()
            .collect(),
        );

        let value = serde_json::to_value(error).expect("serialize domain error");

        assert_eq!(
            value,
            json!({
                "type": "validation",
                "message": "Invalid input.",
                "retryable": false,
                "fieldErrors": {
                    "email": ["Email is required."]
                }
            })
        );
    }

    #[test]
    fn serializes_error_type_as_snake_case() {
        let value =
            serde_json::to_value(DomainErrorType::Unexpected).expect("serialize domain error type");

        assert_eq!(value, json!("unexpected"));
    }
}
