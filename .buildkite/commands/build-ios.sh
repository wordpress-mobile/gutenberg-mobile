#!/bin/bash -eu

echo '--- :desktop_computer: Clear up some disk space'
rm -rfv ~/.Trash/15.1.xip

echo '--- :node: Set up Node dependencies'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit --ignore-scripts

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
# We must use a simulator that's available on the selected Xcode version
# otherwsie Xcode fallbacks to "generic destination" which requires provision
# profiles to built the Demo app.
export RN_EDITOR_E2E_IOS_DESTINATION="platform=iOS Simulator,name=iPhone 15"
set +x

echo '--- :arrow_down: Download iOS bundle'
buildkite-agent artifact download bundle/ios/App.js .
buildkite-agent artifact download ios-assets.tar.gz .

APP_PATH="gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator/GutenbergDemo.app"

mkdir -p "$APP_PATH"
cp bundle/ios/App.js "$APP_PATH/main.jsbundle"
tar -xzvf ios-assets.tar.gz -C "$APP_PATH/"

echo "--- :react: Prepare tests setup"
npm run core test:e2e:setup

echo '--- :react: Build iOS app for E2E testing'
npm run core test:e2e:build-app:ios

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