#!/usr/bin/env bash
# Compiles and runs every LLD reference solution. Each prints "✓ <name>: N checks passed" or fails loudly.
# Requires JDK 21+ (virtual threads, records, pattern matching). Usage: ./lld-java/run-all.sh
set -euo pipefail
cd "$(dirname "$0")"
failed=0
for dir in */; do
  for src in "$dir"*.java; do
    [ -e "$src" ] || continue
    if ! java "$src"; then
      echo "✗ ${dir%/} FAILED"
      failed=1
    fi
  done
done
# SQL from the schema-design lesson, if PostgreSQL binaries are available
if command -v initdb >/dev/null 2>&1 || [ -x /opt/homebrew/opt/postgresql@15/bin/initdb ]; then
  ./schema-design/verify.sh | tail -1 || { echo "✗ schema-design FAILED"; failed=1; }
else
  echo "- schema-design skipped (no PostgreSQL found)"
fi
exit $failed
