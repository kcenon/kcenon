#!/bin/sh
# check-cache-versions.sh — verify the unified cache-buster version is consistent.
#
# Usage: tools/check-cache-versions.sh
#
# Collects every local "?v=" value in portfolio/index.html and portfolio/admin.html
# plus DATA_VERSION in portfolio/data/data.js. If more than one distinct value is
# found, prints every occurrence and exits 1. Exits 0 when all values match.
#
# BSD sed/grep compatible (macOS). Can be run from any working directory; all
# paths resolve relative to the repository root (parent of this script's directory).

set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/portfolio/index.html"
ADMIN="$ROOT/portfolio/admin.html"
DATAJS="$ROOT/portfolio/data/data.js"

for f in "$INDEX" "$ADMIN" "$DATAJS"; do
  if [ ! -f "$f" ]; then
    echo "Error: file not found: $f" >&2
    exit 1
  fi
done

# Template honors TMPDIR (plain "mktemp" on macOS ignores it).
TMP="$(mktemp "${TMPDIR:-/tmp}/check-cache-versions.XXXXXX")"
trap 'rm -f "$TMP"' EXIT

# Local "?v=" occurrences only (attribute values with a scheme, e.g. https://,
# contain ":" and are excluded). Output: "<version> <file>:<asset-path>".
for f in "$INDEX" "$ADMIN"; do
  name="$(basename "$f")"
  grep -o -E '(src|href)="[^":]*\?v=[^"]*"' "$f" \
    | sed -E 's/^(src|href)="([^":]*)\?v=([^"]*)"$/\3 '"$name"':\2/' >> "$TMP"
done

DV="$(sed -n -E "s/.*const DATA_VERSION = '([^']*)'.*/\1/p" "$DATAJS" | head -n 1)"
if [ -z "$DV" ]; then
  echo "Error: DATA_VERSION not found in $DATAJS" >&2
  exit 1
fi
echo "$DV data.js:DATA_VERSION" >> "$TMP"

DISTINCT="$(awk '{print $1}' "$TMP" | sort -u)"
COUNT="$(printf '%s\n' "$DISTINCT" | wc -l | tr -d ' ')"

if [ "$COUNT" -ne 1 ]; then
  echo "Cache-buster version mismatch: $COUNT distinct values found." >&2
  echo "Occurrences (version  location):" >&2
  sort "$TMP" >&2
  exit 1
fi

echo "OK: all local cache busters and DATA_VERSION are $DISTINCT"
