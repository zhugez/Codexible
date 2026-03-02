# Specification: Dockerize Project

## Core Requirements

### Requirement: Single Command Startup
- **Description:** The entire stack (frontend, backend, database, cache) MUST start with a single `docker compose up` command from the project root.
- **Priority:** High
- **Acceptance Criteria:**
  - **GIVEN** a fresh clone of the repository with Docker installed
  - **WHEN** the user runs `docker compose up --build`
  - **THEN** all four services (frontend, backend, postgres, redis) MUST start and become healthy.

### Requirement: Production-Ready Frontend Container
- **Description:** The frontend MUST be served as a production Next.js build inside a container, not a dev server.
- **Priority:** High
- **Acceptance Criteria:**
  - **GIVEN** the frontend container is running
  - **WHEN** the user visits `http://localhost:10001`
  - **THEN** the Codexible landing page MUST load correctly.

### Requirement: Service Dependencies
- **Description:** Services MUST start in the correct order with health checks to prevent connection errors.
- **Priority:** Medium
- **Acceptance Criteria:**
  - **GIVEN** `docker compose up` is run
  - **WHEN** the backend starts
  - **THEN** Postgres and Redis MUST already be healthy and accepting connections.
