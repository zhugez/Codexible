# Specs: Fix Backend Compilation

- **GIVEN** the backend code with fred v10 and axum 0.8
- **WHEN** `cargo build --release` is run
- **THEN** compilation MUST succeed with no errors
