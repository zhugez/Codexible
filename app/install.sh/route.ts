import { NextRequest, NextResponse } from "next/server";

function escapeSingleQuotes(input: string) {
  return input.replace(/'/g, "'\\''");
}

function buildScript(defaultKey: string, defaultBaseUrl: string) {
  const safeKey = escapeSingleQuotes(defaultKey);
  const safeBase = escapeSingleQuotes(defaultBaseUrl);

  return `#!/usr/bin/env bash
set -euo pipefail

DEFAULT_KEY='${safeKey}'
DEFAULT_BASE_URL='${safeBase}'

KEY="\${1:-\${CODEXIBLE_API_KEY:-\${DEFAULT_KEY}}}"
BASE_URL="\${CODEXIBLE_BASE_URL:-\${DEFAULT_BASE_URL}}"

if [[ -z "\${KEY}" ]]; then
  echo "[codexible] Missing API key."
  echo "Usage:"
  echo "  curl -fsSL 'https://codexible.ai/install.sh?key=YOUR_KEY' | bash"
  echo "or"
  echo "  CODEXIBLE_API_KEY=YOUR_KEY curl -fsSL 'https://codexible.ai/install.sh' | bash"
  exit 1
fi

CONFIG_DIR="\${XDG_CONFIG_HOME:-\${HOME}/.config}/codexible"
CONFIG_FILE="\${CONFIG_DIR}/config"
BIN_DIR="\${HOME}/.local/bin"
BIN_FILE="\${BIN_DIR}/codexible"

mkdir -p "\${CONFIG_DIR}" "\${BIN_DIR}"

cat > "\${CONFIG_FILE}" <<EOF
CODEXIBLE_API_KEY="\${KEY}"
CODEXIBLE_BASE_URL="\${BASE_URL}"
EOF

cat > "\${BIN_FILE}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="\${XDG_CONFIG_HOME:-\${HOME}/.config}/codexible/config"
if [[ -f "\${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "\${CONFIG_FILE}"
fi

CMD="\${1:-help}"
shift || true

case "\${CMD}" in
  env)
    echo "CODEXIBLE_BASE_URL=\${CODEXIBLE_BASE_URL:-https://api.codexible.ai/v1}"
    if [[ -n "\${CODEXIBLE_API_KEY:-}" ]]; then
      echo "CODEXIBLE_API_KEY=***configured***"
    else
      echo "CODEXIBLE_API_KEY=missing"
    fi
    ;;

  curl)
    if [[ -z "\${CODEXIBLE_API_KEY:-}" ]]; then
      echo "[codexible] Missing CODEXIBLE_API_KEY. Run installer again."
      exit 1
    fi

    PATH_SUFFIX="\${1:-/health}"
    shift || true

    if [[ "\${PATH_SUFFIX}" != /* ]]; then
      PATH_SUFFIX="/\${PATH_SUFFIX}"
    fi

    exec curl -fsSL \
      -H "Authorization: Bearer \${CODEXIBLE_API_KEY}" \
      "\${CODEXIBLE_BASE_URL:-https://api.codexible.ai/v1}\${PATH_SUFFIX}" \
      "$@"
    ;;

  help|*)
    cat <<HELP
codexible CLI

Usage:
  codexible env
  codexible curl /health
  codexible curl /v1/models

Notes:
  - Config file: \${CONFIG_FILE}
  - Auth header: Authorization: Bearer <CODEXIBLE_API_KEY>
HELP
    ;;
esac
EOF

chmod +x "\${BIN_FILE}"

echo "[codexible] Installed ✅"
echo "[codexible] Config: \${CONFIG_FILE}"
echo "[codexible] Binary: \${BIN_FILE}"

echo
if [[ ":\${PATH}:" != *":\${BIN_DIR}:"* ]]; then
  echo "Add this to your shell profile if needed:"
  echo "  export PATH=\"\${BIN_DIR}:\$PATH\""
  echo
fi

echo "Quick test:"
echo "  codexible env"
echo "  codexible curl /health"
`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key") ?? "";
  const base = searchParams.get("base") ?? "https://api.codexible.ai/v1";

  const script = buildScript(key, base);

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
