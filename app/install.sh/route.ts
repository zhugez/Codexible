import { NextRequest, NextResponse } from "next/server";

function escapeSingleQuotes(input: string) {
  return input.replace(/'/g, "'\\''");
}

function buildScript(defaultKey: string, defaultEndpoint: string) {
  const safeKey = escapeSingleQuotes(defaultKey);
  const safeEndpoint = escapeSingleQuotes(defaultEndpoint);

  return `#!/usr/bin/env sh

# ==========================================
#        Codexible Installer
# Configure Codexible environment
# ==========================================

set -e

# ==============================
# Configuration
# ==============================

ENDPOINT_URL='${safeEndpoint}'
DEFAULT_API_KEY='${safeKey}'

# Default Models
PRIMARY_MODEL="gpt-5.3-codex"
FALLBACK_MODEL1="gpt-5.2-codex"
FALLBACK_MODEL2="kimi-k2.5"

# ==============================
# Colors
# ==============================
RED=$(printf '\\033[0;31m')
GREEN=$(printf '\\033[0;32m')
YELLOW=$(printf '\\033[1;33m')
BLUE=$(printf '\\033[0;34m')
NC=$(printf '\\033[0m')

echo "\${BLUE}================================\${NC}"
echo "\${BLUE}       Codexible Installer\${NC}"
echo "\${BLUE}================================\${NC}"
echo ""

# ==============================
# API Key Input
# ==============================
API_KEY="\${1:-\${CODEXIBLE_API_KEY:-\${DEFAULT_API_KEY}}}"

if [ -z "\${API_KEY}" ] && [ -r /dev/tty ]; then
  printf "Enter your Codexible API Key: " > /dev/tty
  IFS= read -r API_KEY < /dev/tty || true
fi

if [ -z "\${API_KEY}" ]; then
  echo "\${RED}Error: API key cannot be empty\${NC}"
  echo "\${YELLOW}Usage:\${NC}"
  echo "  curl -fsSL 'https://codexible.ai/install.sh?key=YOUR_KEY' | sh"
  echo "or"
  echo "  CODEXIBLE_API_KEY=YOUR_KEY curl -fsSL 'https://codexible.ai/install.sh' | sh"
  exit 1
fi

MASKED_KEY=$(printf "%s" "\${API_KEY}" | cut -c 1-8)

echo ""
echo "Endpoint: \${GREEN}\${ENDPOINT_URL}\${NC}"
echo "API Key:  \${GREEN}\${MASKED_KEY}...\${NC}"
echo ""
echo "Using Models:"
echo "  Primary  : \${GREEN}\${PRIMARY_MODEL}\${NC}"
echo "  Fallback1: \${GREEN}\${FALLBACK_MODEL1}\${NC}"
echo "  Fallback2: \${GREEN}\${FALLBACK_MODEL2}\${NC}"
echo ""

# ==============================
# Backup + config helpers
# ==============================
backup_file() {
  f="$1"
  [ -f "$f" ] && cp "$f" "\${f}.backup.$(date +%Y%m%d%H%M%S)"
}

clean_old_vars() {
  f="$1"
  if [ -f "$f" ]; then
    sed '/^export CODEXIBLE_/d' "$f" > "\${f}.tmp"
    mv "\${f}.tmp" "$f"
  fi
}

add_env_vars() {
  f="$1"
  clean_old_vars "$f"
  echo "" >> "$f"
  echo "# Codexible configuration" >> "$f"
  echo "export CODEXIBLE_BASE_URL=\"\${ENDPOINT_URL}\"" >> "$f"
  echo "export CODEXIBLE_API_KEY=\"\${API_KEY}\"" >> "$f"
  echo "export CODEXIBLE_MODEL_PRIMARY=\"\${PRIMARY_MODEL}\"" >> "$f"
  echo "export CODEXIBLE_MODEL_FALLBACK1=\"\${FALLBACK_MODEL1}\"" >> "$f"
  echo "export CODEXIBLE_MODEL_FALLBACK2=\"\${FALLBACK_MODEL2}\"" >> "$f"
}

# ==============================
# Update Shell Config
# ==============================
echo "\${BLUE}Configuring shell...\${NC}"

if [ -f "$HOME/.bashrc" ]; then
  backup_file "$HOME/.bashrc"
  add_env_vars "$HOME/.bashrc"
  echo "  \${GREEN}Updated .bashrc\${NC}"
fi

if [ -f "$HOME/.zshrc" ]; then
  backup_file "$HOME/.zshrc"
  add_env_vars "$HOME/.zshrc"
  echo "  \${GREEN}Updated .zshrc\${NC}"
fi

# ==============================
# Update settings.json
# ==============================
echo ""
echo "\${BLUE}Updating Codexible settings...\${NC}"

SETTINGS="$HOME/.codexible/settings.json"
mkdir -p "$(dirname "$SETTINGS")"
backup_file "$SETTINGS"

cat > "$SETTINGS" <<EOF
{
  "endpoint": "\${ENDPOINT_URL}",
  "api_key": "\${API_KEY}",
  "models": {
    "primary": "\${PRIMARY_MODEL}",
    "fallback1": "\${FALLBACK_MODEL1}",
    "fallback2": "\${FALLBACK_MODEL2}"
  },
  "disableLoginPrompt": true
}
EOF

echo "  \${GREEN}settings.json updated\${NC}"

# ==============================
# Done
# ==============================
echo ""
echo "\${GREEN}================================\${NC}"
echo "\${GREEN}    Codexible Setup Complete\${NC}"
echo "\${GREEN}================================\${NC}"
echo ""
echo "Restart your terminal or run:"
echo "  \${BLUE}source ~/.bashrc\${NC}"
echo ""
echo "Then use Codexible CLI normally."
`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key") ?? "";
  const endpoint = searchParams.get("endpoint") ?? "https://codexible.me";

  const script = buildScript(key, endpoint);

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
