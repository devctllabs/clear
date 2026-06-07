use std::collections::BTreeMap;

use serde::Serialize;

pub type ValidationIssueParams = BTreeMap<String, serde_json::Value>;

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationIssue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<Vec<String>>,
    pub code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<ValidationIssueParams>,
}

impl ValidationIssue {
    pub fn new(code: impl Into<String>) -> Self {
        Self {
            path: None,
            code: code.into(),
            params: None,
        }
    }

    pub fn at_path(
        path: impl IntoIterator<Item = impl Into<String>>,
        code: impl Into<String>,
    ) -> Self {
        Self {
            path: Some(path.into_iter().map(Into::into).collect()),
            code: code.into(),
            params: None,
        }
    }

    pub fn with_params(mut self, params: ValidationIssueParams) -> Self {
        self.params = Some(params);
        self
    }
}

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

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainError {
    #[serde(rename = "type")]
    pub error_type: DomainErrorType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub retryable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub issues: Option<Vec<ValidationIssue>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_id: Option<String>,
}

impl DomainError {
    pub fn validation(issues: Vec<ValidationIssue>) -> Self {
        Self {
            error_type: DomainErrorType::Validation,
            message: None,
            retryable: false,
            issues: Some(issues),
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
            message: Some(message.into()),
            retryable: false,
            issues: None,
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
            message: Some(message.into()),
            retryable,
            issues: None,
            entity: None,
            entity_id: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{DomainError, DomainErrorType, ValidationIssue};

    #[test]
    fn serializes_validation_errors_using_the_ui_contract_shape() {
        let error = DomainError::validation(vec![ValidationIssue::at_path(["email"], "required")]);

        let value = serde_json::to_value(error).expect("serialize domain error");

        assert_eq!(
            value,
            json!({
                "type": "validation",
                "retryable": false,
                "issues": [
                    {
                        "path": ["email"],
                        "code": "required"
                    }
                ]
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
