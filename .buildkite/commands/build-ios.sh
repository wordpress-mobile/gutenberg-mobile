#!/bin/bash -eu

echo '--- :node: Setup Node dependencies'
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo '--- :ios: Set env var for iOS E2E testing'
set -x
CONFIG_FILE="$(pwd)/gutenberg/packages/react-native-editor/__device-tests__/helpers/device-config.json"
IOS_DEVICE_NAME=$(jq -r '.ios.local.deviceName' "$CONFIG_FILE")
export IOS_PLATFORM_VERSION=$(jq -r '.ios.buildkite.platformVersion' "$CONFIG_FILE")
# Set a destination different from the hardcoded one which only works in the
# older Xcode-setup used by CircleCI
export RN_EDITOR_E2E_IOS_DESTINATION="platform=iOS Simulator,name=$IOS_DEVICE_NAME,OS=$IOS_PLATFORM_VERSION"
set +x

echo '--- :react: Build iOS app for E2E testing'
npm run core test:e2e:build-app:ios

echo '--- :react: Build iOS bundle for E2E testing'
npm run test:e2e:bundle:ios

echo "--- :react: Prepare tests setup"
npm run core test:e2e:setup

echo '--- :react: Build WDA for E2E testing'
npm run core test:e2e:build-wda

echo '--- :compression: Prepare artifacts'
WORK_DIR=$(pwd) \
  && pushd ./gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator \
  && zip -r "$WORK_DIR/gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip" GutenbergDemo.app \
  && popd

WORK_DIR=$(pwd) \
  && pushd ./gutenberg/packages/react-native-editor/ios/build/WDA \
  && zip -r "$WORK_DIR/gutenberg/packages/react-native-editor/ios/WDA.zip" ./* \
  && popd

echo "--- :arrow_up: Upload Build Products"
upload_artifact "./gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip"
upload_artifact "./gutenberg/packages/react-native-editor/ios/WDA.zip"
