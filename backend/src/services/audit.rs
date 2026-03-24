use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct AuditEvent {
    pub timestamp: DateTime<Utc>,
    pub actor: String,
    pub action: String,
    pub target: String,
    pub details: String,
}

#[derive(Clone)]
pub struct AuditStore {
    events: Arc<Mutex<VecDeque<AuditEvent>>>,
    max_entries: usize,
}

impl AuditStore {
    pub fn new(max_entries: usize) -> Self {
        Self {
            events: Arc::new(Mutex::new(VecDeque::new())),
            max_entries: max_entries.max(50),
        }
    }

    pub fn record(&self, actor: impl Into<String>, action: impl Into<String>, target: impl Into<String>, details: impl Into<String>) {
        let mut events = self.events.lock().expect("audit store mutex poisoned");
        events.push_front(AuditEvent {
            timestamp: Utc::now(),
            actor: actor.into(),
            action: action.into(),
            target: target.into(),
            details: details.into(),
        });

        while events.len() > self.max_entries {
            let _ = events.pop_back();
        }
    }

    pub fn list(&self, limit: usize, query: Option<&str>) -> Vec<AuditEvent> {
        let events = self.events.lock().expect("audit store mutex poisoned");
        let normalized_query = query.map(|q| q.to_ascii_lowercase());

        events
            .iter()
            .filter(|event| {
                if let Some(ref q) = normalized_query {
                    event.actor.to_ascii_lowercase().contains(q)
                        || event.action.to_ascii_lowercase().contains(q)
                        || event.target.to_ascii_lowercase().contains(q)
                        || event.details.to_ascii_lowercase().contains(q)
                } else {
                    true
                }
            })
            .take(limit.max(1).min(500))
            .cloned()
            .collect()
    }
}

pub fn redact_secret(input: &str) -> String {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return "<empty>".into();
    }

    let prefix_len = trimmed.len().min(6);
    let suffix_len = trimmed.len().min(4);
    if trimmed.len() <= prefix_len + suffix_len {
        return "***".into();
    }

    format!("{}***{}", &trimmed[..prefix_len], &trimmed[trimmed.len() - suffix_len..])
}
