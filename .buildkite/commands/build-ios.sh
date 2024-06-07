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
export TEST_ENV=local
# We must use a simulator that's available on the selected Xcode version
# otherwsie Xcode fallbacks to "generic destination" which requires provision
# profiles to built the Demo app.
export RN_EDITOR_E2E_IOS_DESTINATION="platform=iOS Simulator,name=iPhone 15"
set +x

echo "--- :react: Prepare tests setup"
npm run core test:e2e:setup

echo '--- :react: Build iOS bundle for E2E testing'
npm run test:e2e:bundle:ios

echo '--- :react: Build iOS app for E2E testing'
npm run core test:e2e:build-app:ios

echo '--- :react: Build WDA for E2E testing'
npm run core test:e2e:build-wda

echo '--- :compression: Prepare artifacts'
WORK_DIR=$(pwd) \
  && pushd ./gutenberg/packages/react-native-editor/ios/build/WDA \
  && zip -r "$WORK_DIR/gutenberg/packages/react-native-editor/ios/WDA.zip" ./* \
  && popd

echo "--- :arrow_up: Upload Build"
upload_artifact "./gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip"
upload_artifact "./gutenberg/packages/react-native-editor/ios/WDA.zip"

echo "--- :cocoapods: Save Pods cache if necessary"
pushd "$PODS_PATH"
save_cache "$PODS_FOLDER" "$PODFILE_CACHEKEY"
popd
