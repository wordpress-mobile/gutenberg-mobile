#!/bin/bash -eu

# Builds an archive with the XCFrameworks necessary to import Gutenberg in iOS apps.
#
# Special thanks to the work done in
# https://hackernoon.com/cocoapod-as-xcframework-with-dependencies and
# https://github.com/traveloka/ios-rn-prebuilt which informed this script.

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

function log {
  if [[ $# -eq 1 ]]; then
    PREFIX=''
    MESSAGE=$1
  else
    PREFIX=":$1: "
    MESSAGE=$2
  fi

  if [[ -n "${BUILDKITE:-}" ]]; then
    echo "--- $PREFIX$MESSAGE"
  else
    echo "$MESSAGE"
  fi
}

function archive {
  PLATFORM=$1

  log "Archiving $SCHEME for $PLATFORM platform"

  _xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -sdk "$PLATFORM" \
    -archivePath "$ARCHIVES_ROOT/$PLATFORM.xcarchive" \
    -derivedDataPath "$DERIVED_DATA_PATH" \
    BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
    SKIP_INSTALL=NO
}

BUILD_DIR=./build
DERIVED_DATA_PATH="$BUILD_DIR/derived_data"
ARCHIVES_ROOT="$BUILD_DIR/archives"
XCFRAMEWORKS_DIR="$BUILD_DIR/xcframeworks"

rm -rf $BUILD_DIR

MAIN_FRAMEWORK_NAME=Gutenberg
WORKSPACE="./XCFrameworkScaffold.xcworkspace"
SCHEME=$MAIN_FRAMEWORK_NAME

PLATFORM_IOS=iphoneos
PLATFORM_SIMULATOR=iphonesimulator

# 1. Generate archives (xcarchive) for iOS and Simulator
archive $PLATFORM_IOS
archive $PLATFORM_SIMULATOR

# 2. Create XCFrameworks for every framework in the archives
#
# Notice how we loop on $PLATFORM_IOS as a way to get the frameworks for both platforms.
# We could use either platform to achieve the same result.
for FRAMEWORK in $(find "$ARCHIVES_ROOT/$PLATFORM_IOS.xcarchive/Products/Library/Frameworks" -type d -name "*.framework");
do
  CURRENT_FRAMEWORK_NAME=$(basename "$FRAMEWORK" .framework)

  # TODO: Use a framework list instead of building all of them?

  # 1. Create XCFrameworks for every framework that was generated by the main
  # framework build process
  FRAMEWORK_RELATIVE_PATH="Products/Library/Frameworks/$CURRENT_FRAMEWORK_NAME.framework"

  if [[ $CURRENT_FRAMEWORK_NAME = 'hermes' ]]; then
    log 'no_good' "Skipping creating XCFramework for $CURRENT_FRAMEWORK_NAME"
    continue
  fi

  log 'package' "Creating XCFramework for $CURRENT_FRAMEWORK_NAME"

  _xcodebuild \
    -create-xcframework \
    -framework "$ARCHIVES_ROOT/$PLATFORM_IOS.xcarchive/$FRAMEWORK_RELATIVE_PATH" \
    -framework "$ARCHIVES_ROOT/$PLATFORM_SIMULATOR.xcarchive/$FRAMEWORK_RELATIVE_PATH" \
    -output "$XCFRAMEWORKS_DIR/$CURRENT_FRAMEWORK_NAME.xcframework"
done

log 'bulb' 'Work around "Gutenberg class ahead of Gutenberg module" issue'
# We generate a Gutenberg framework with a Gutenberg class in it.
# This results in some types in the swiftinterface being defined as Gutenberg.Gutenberg.Type which cannot be resolved.
# There is no fix, but we can work around it by post-processing the interface and flattening the namespace where appropriate.
#
# See https://developer.apple.com/forums/thread/123253
#
# TODO: There has to be a RegEx that can do what this sequence does in one go. Something along the lines of s/(^|\s|\[)Gutenberg\.(?!self)/\1/g but that doesn't throw errors
find $XCFRAMEWORKS_DIR -name "*.swiftinterface" -exec sed -i -e 's/Gutenberg\.self/PLACEHOLDER_TO_REVERT_SED/g' {} \;
find $XCFRAMEWORKS_DIR -name "*.swiftinterface" -exec sed -i -e 's/ Gutenberg\./ /g' {} \;
find $XCFRAMEWORKS_DIR -name "*.swiftinterface" -exec sed -i -e 's/\[Gutenberg\./[/g' {} \;
find $XCFRAMEWORKS_DIR -name "*.swiftinterface" -exec sed -i -e 's/PLACEHOLDER_TO_REVERT_SED/Gutenberg.self/g' {} \;

log 'compression' 'Compressing Gutenberg XCFrameworks'

# For CocoaPods to find the XCFrameworks in the archive, it needs to have a certain folder structure.
#
# See for example what Firebase does,
# https://github.com/CocoaPods/Specs/blob/master/Specs/e/2/1/FirebaseAnalytics/9.6.0/FirebaseAnalytics.podspec.json
#
# Archive/
#   - Frameworks/
#     - A.xcframework
#     - B.xcframework
#   - dummy.txt
DUMMY_FILE_NAME='dummy.txt'
echo "This is a work around for file flattening introduced by https://github.com/CocoaPods/CocoaPods/pull/728" > "$XCFRAMEWORKS_DIR/$DUMMY_FILE_NAME"

ARCHIVE_FRAMEWORKS_DIR_NAME="Frameworks"
ARCHIVE_FRAMEWORKS_PATH="$XCFRAMEWORKS_DIR/$ARCHIVE_FRAMEWORKS_DIR_NAME"

mkdir -p "$ARCHIVE_FRAMEWORKS_PATH"

cp -r "$XCFRAMEWORKS_DIR/Aztec.xcframework" "$ARCHIVE_FRAMEWORKS_PATH"
cp -r "$XCFRAMEWORKS_DIR/Gutenberg.xcframework" "$ARCHIVE_FRAMEWORKS_PATH"
cp -r "$XCFRAMEWORKS_DIR/React.xcframework" "$ARCHIVE_FRAMEWORKS_PATH"
cp -r "$XCFRAMEWORKS_DIR/RNTAztecView.xcframework" "$ARCHIVE_FRAMEWORKS_PATH"
cp -r "$XCFRAMEWORKS_DIR/yoga.xcframework" "$ARCHIVE_FRAMEWORKS_PATH"

ARCHIVE_PATH="$XCFRAMEWORKS_DIR/$MAIN_FRAMEWORK_NAME.tar.gz"

tar -czf "$ARCHIVE_PATH" -C "$XCFRAMEWORKS_DIR" \
  "$ARCHIVE_FRAMEWORKS_DIR_NAME" \
  "$DUMMY_FILE_NAME"

echo "Gutenberg XCFrameworks archive generated at $ARCHIVE_PATH"
