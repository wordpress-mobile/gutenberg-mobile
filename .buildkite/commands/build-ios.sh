#!/bin/bash -eu

echo '--- :desktop_computer: Clear up some disk space'
rm -rfv ~/.Trash/15.1.xip

echo '--- :node: Set up Node dependencies'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit --ignore-scripts

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=sauce
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

echo '--- :react: Build iOS app for E2E testing'
npm run core test:e2e:build-app:ios

echo '--- :compression: Prepare artifact for SauceLabs upload'
WORK_DIR=$(pwd) \
  && pushd ./gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator \
  && zip -r "$WORK_DIR/gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip" GutenbergDemo.app \
  && popd

echo '--- :saucelabs: Upload app artifact to SauceLabs'
SAUCE_FILENAME=${BUILDKITE_BRANCH//[\/]/-}
curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  --location \
  --request POST 'https://api.us-west-1.saucelabs.com/v1/storage/upload' \
  --form 'payload=@"./gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip"' \
  --form "name=Gutenberg-$SAUCE_FILENAME.app.zip" \
  --form 'description="Gutenberg"'
