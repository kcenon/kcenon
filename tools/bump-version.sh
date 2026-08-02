#!/bin/sh
# bump-version.sh — set the unified cache-buster version across the portfolio.
#
# Usage: tools/bump-version.sh <version>   (e.g. tools/bump-version.sh 1.17.0)
#
# Replaces, in one pass:
#   - every local "?v=" query in portfolio/index.html and portfolio/admin.html
#     (external URLs containing a scheme, e.g. "https://", are left untouched)
#   - DATA_VERSION in portfolio/data/data.js
#
# BSD sed compatible (macOS). Can be run from any working directory; all paths
# resolve relative to the repository root (parent of this script's directory).

set -eu

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>  (e.g. $0 1.17.0)" >&2
  exit 2
fi

VERSION="$1"
case "$VERSION" in
  ''|*[!0-9A-Za-z.-]*)
    echo "Error: invalid version string: '$VERSION' (allowed: digits, letters, dots, dashes)" >&2
    exit 2
    ;;
esac

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

# In-place edit that works with both BSD and GNU sed and preserves file mode.
replace_in_file() {
  # $1 = file, $2 = sed -E expression
  # Template honors TMPDIR (plain "mktemp" on macOS ignores it).
  tmp="$(mktemp "${TMPDIR:-/tmp}/bump-version.XXXXXX")"
  sed -E "$2" "$1" > "$tmp"
  cat "$tmp" > "$1"
  rm -f "$tmp"
}

# Local asset references only: attribute values without a URL scheme (no ":").
HTML_EXPR='s/((src|href)="[^":]*\?v=)[^"]*"/\1'"$VERSION"'"/g'
replace_in_file "$INDEX" "$HTML_EXPR"
replace_in_file "$ADMIN" "$HTML_EXPR"

# DATA_VERSION constant in data.js.
replace_in_file "$DATAJS" "s/(const DATA_VERSION = ')[^']*(')/\1$VERSION\2/"

echo "Bumped all local cache busters and DATA_VERSION to $VERSION"
echo "Verify with: tools/check-cache-versions.sh"
