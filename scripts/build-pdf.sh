#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to build the resume."
  exit 1
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Dependencies are missing. Run npm install first."
  exit 1
fi

node "$ROOT_DIR/scripts/build-resume.mjs"
