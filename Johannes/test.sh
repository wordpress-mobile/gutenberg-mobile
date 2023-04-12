#!/bin/bash -eu

set -o pipefail

# Remove DerivedData to have a clean slate
rm -rf DerivedData

# Make sure the xcframework project builds first
bundle exec pod install

WORKSPACE='Johannes.xcworkspace'
DESTINATION='platform=iOS Simulator,name=iPhone 14 Pro,OS=latest'

xcodebuild \
  -workspace $WORKSPACE \
  -scheme 'Johannes' \
  -destination "$DESTINATION" \
  | xcbeautify

# Build a fresh XCFramework
sh ./build-xcframework.sh

# Build the app that uses the XCFramework
xcodebuild \
  -workspace $WORKSPACE \
  -scheme 'JohannesDemoXCFramework' \
  -destination "$DESTINATION" \
  | xcbeautify
