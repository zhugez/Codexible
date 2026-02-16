# Install Modal Prototype

Goal: avoid opening a new tab for installer content (which can trigger Cloudflare/new-tab issues). Instead, show the script (or an install command) in a modal and allow copy.

## What this prototype does

- Button **View install.sh in modal** fetches `/install.sh` (optionally with `?key=`) and displays the response **as text** inside a `<pre><code>` block.
- Button **Copy safe one-liner** copies a one-liner installer command and also displays it in the modal.
- Modal UX:
  - Close via **X**, **backdrop click**, or **Escape**
  - Copy button copies whatever is currently shown

## Security properties

- Modal content is injected via `textContent` only (no HTML rendering).
- Key input is normalized to remove control characters (no newlines).

## How to test

Open `index.html` in a browser:

- `prototype/install-modal/index.html`

Then:

1. Optionally paste an API key.
2. Click **View install.sh in modal**.
3. Click **Copy**.

## Where to integrate in the real site

On the real Claudible site, replace any link that currently opens:

- `https://claudible.io/install.sh` (or `?key=...`)

with an in-page handler that:

1. `fetch()` the script
2. sets the modal code block `textContent` to the response
3. provides a copy button

This avoids spawning a new tab.

## IMPORTANT (pentest finding)

This prototype is only UX. The server-side installer endpoints must also **sanitize/encode** `key` safely.
Currently, command-substitution sequences like `$(...)` and backticks are reflected into `API_KEY="..."` and will execute when a user runs `curl | sh`.
