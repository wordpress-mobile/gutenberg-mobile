#!/bin/bash -eu

PLATFORM=$(uname -s)
ARCHITECTURE=$(uname -m)
PODFILE_HASH=$(hash_file gutenberg/packages/react-native-editor/ios/Podfile.lock)
PODFILE_CACHEKEY="$BUILDKITE_PIPELINE_SLUG-pods-$PLATFORM-$ARCHITECTURE-$PODFILE_HASH"
PODS_PATH="gutenberg/packages/react-native-editor/ios"
PODS_FOLDER="Pods"

echo '--- :desktop_computer: Clear up some disk space'
rm -rfv ~/.Trash/15.1.xip

.buildkite/commands/install-node-dependencies.sh

echo "--- :cocoapods: Restore Pods if present"
pushd "$PODS_PATH"
restore_cache "$PODFILE_CACHEKEY"
popd

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=sauce
# We must use a simulator that's available on the selected Xcode version
# otherwsie Xcode fallbacks to "generic destination" which requires provision
# profiles to built the Demo app.
export RN_EDITOR_E2E_IOS_DESTINATION="platform=iOS Simulator,name=iPhone 15"
set +x

echo '--- :react: Build iOS bundle for E2E testing'
npm run test:e2e:bundle:ios

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

echo "--- :cocoapods: Save Pods cache if necessary"
pushd "$PODS_PATH"
save_cache "$PODS_FOLDER" "$PODFILE_CACHEKEY"
popd
