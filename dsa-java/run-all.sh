#!/usr/bin/env bash
# Runs every DSA lesson's solutions and tests. Each prints "✓ <name>: N checks passed" or fails loudly.
set -euo pipefail
cd "$(dirname "$0")"
failed=0
for src in */*.java; do
  java "$src" || { echo "✗ $src FAILED"; failed=1; }
done
exit $failed
