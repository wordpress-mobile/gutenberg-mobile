#!/bin/bash -eu

set -o pipefail

# Remove DerivedData to have a clean slate
# TODO: Inject derived data path into xcodebulid commands to make it deteriministic
DERIVED_DATA_PATH=DerivedData
rm -rf $DERIVED_DATA_PATH

# Make sure the xcframework project builds first
bundle exec pod install

WORKSPACE='Johannes.xcworkspace'
DESTINATION='platform=iOS Simulator,name=iPhone 14 Pro,OS=latest'

xcodebuild \
  -workspace $WORKSPACE \
  -scheme 'Johannes' \
  -destination "$DESTINATION" \
  | xcbeautify

# Build fresh XCFrameworks
sh ./build-all-xcframeworks.sh

# If we don't remove the derived data, we incure in build failures due to
# symbols not found. ¯\_(ツ)_/¯
rm -rf $DERIVED_DATA_PATH

# Build the app that uses the XCFramework
xcodebuild \
  -workspace $WORKSPACE \
  -scheme 'JohannesDemoXCFramework' \
  -destination "$DESTINATION" \
  | xcbeautify
