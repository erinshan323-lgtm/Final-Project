#!/bin/zsh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [[ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  echo "Node.js 20 or later is required. Install it from https://nodejs.org and try again."
  read -r "?Press Enter to close."
  exit 1
fi
NODE_MAJOR="$($NODE_BIN -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 20 )); then
  echo "Please update Node.js to version 20 or later."
  read -r "?Press Enter to close."
  exit 1
fi
echo "Circuit Journal"
echo "Open http://127.0.0.1:${PORT:-4317} in your browser."
echo "Keep this window open. Press Control-C to stop."
exec "$NODE_BIN" server.mjs
