#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_FILE="$ROOT_DIR/resume.frontend.md"
OUTPUT_DIR="$ROOT_DIR/dist"
OUTPUT_FILE="$OUTPUT_DIR/resume.frontend.pdf"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc is required to build the PDF."
  echo "Install it first, then rerun: ./scripts/build-pdf.sh"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

pandoc "$SOURCE_FILE" \
  --standalone \
  --pdf-engine=xelatex \
  --metadata title="Frontend Resume" \
  --metadata mainfont="Noto Sans" \
  --metadata CJKmainfont="Noto Sans CJK SC" \
  -o "$OUTPUT_FILE"

echo "Built $OUTPUT_FILE"
