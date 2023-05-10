#!/bin/bash -eu

set -o pipefail

# This wraps calling xcodebuild in a function that passes the output to
# the xcbeautify formatter, but only if available.
#
# Output formatting is handy, but we don't want it to block running this
# script.
function _xcodebuild {
    FORMATTER=xcbeautify

    if command -v $FORMATTER &> /dev/null; then
        xcodebuild "$@" | $FORMATTER
    else
      echo "$FORMATTER not found, you will see raw xcodebuild output"
        xcodebuild "$@"
    fi
}

DERIVED_DATA_PATH=./DerivedData
DESTINATION='generic/platform=iOS'

rm -rf $DERIVED_DATA_PATH

_xcodebuild clean build \
  -project ./XCFrameworkScaffold.xcodeproj \
  -scheme 'Gutenberg' \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED_DATA_PATH"
