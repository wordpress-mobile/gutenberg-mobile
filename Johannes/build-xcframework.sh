#!/bin/bash -eu

# See https://hackernoon.com/cocoapod-as-xcframework-with-dependencies

FRAMEWORK_NAME=Johannes
WORKSPACE="$FRAMEWORK_NAME.xcworkspace"
SCHEME=$FRAMEWORK_NAME

ARCHIVES_ROOT=archives
IOS_DEVICE_ARCHIVE_PATH="$ARCHIVES_ROOT/ios_devices.xcarchive"
IOS_SIMULATOR_ARCHIVE_PATH="$ARCHIVES_ROOT/ios_simulators.xcarchive"

FINAL_OUTPUT="$FRAMEWORK_NAME.xcframework"

rm -rf "$ARCHIVES_ROOT"
rm -rf "$FINAL_OUTPUT"

# 1. Archive for iOS
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphoneos \
  -archivePath "$IOS_DEVICE_ARCHIVE_PATH" \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
  SKIP_INSTALL=NO \
  | xcbeautify

# 2. Archive for Simulator
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -sdk iphonesimulator \
  -archivePath "$IOS_SIMULATOR_ARCHIVE_PATH" \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES \
  SKIP_INSTALL=NO \
  | xcbeautify

FRAMEWORK_RELATIVE_PATH="Products/Library/Frameworks/$FRAMEWORK_NAME.framework"

# 3. Combine archives into XCFramework
xcodebuild \
  -create-xcframework \
  -framework "$IOS_DEVICE_ARCHIVE_PATH/$FRAMEWORK_RELATIVE_PATH" \
  -framework "$IOS_SIMULATOR_ARCHIVE_PATH/$FRAMEWORK_RELATIVE_PATH" \
  -output "$FINAL_OUTPUT" \
  | xcbeautify
