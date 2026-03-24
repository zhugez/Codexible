use crate::config::{Config, ModelRate};

/// Calculate USD cost for a request based on model and token counts.
pub fn calculate_cost(
    model: &str,
    prompt_tokens: i32,
    completion_tokens: i32,
    config: &Config,
) -> f64 {
    let (prompt_rate, completion_rate) = if let Some(rate) = config.proxy_model_rates.get(model) {
        (rate.prompt_per_1k, rate.completion_per_1k)
    } else {
        (
            config.proxy_cost_prompt_per_1k,
            config.proxy_cost_completion_per_1k,
        )
    };

    let prompt_cost = (prompt_tokens as f64 / 1000.0) * prompt_rate;
    let completion_cost = (completion_tokens as f64 / 1000.0) * completion_rate;

    ((prompt_cost + completion_cost) * 1_000_000.0).round() / 1_000_000.0
}
