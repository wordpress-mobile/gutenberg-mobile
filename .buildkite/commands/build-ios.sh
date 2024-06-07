#!/bin/bash -eu

PLATFORM=$(uname -s)
ARCHITECTURE=$(uname -m)

# Base Paths
REACT_NATIVE_EDITOR_PATH="gutenberg/packages/react-native-editor/ios"
BUILD_PATH="$REACT_NATIVE_EDITOR_PATH/build"
PRODUCTS_PATH="$BUILD_PATH/GutenbergDemo/Build/Products/Release-iphonesimulator"
APP_PATH="$PRODUCTS_PATH/GutenbergDemo.app"
PODS_PATH="$REACT_NATIVE_EDITOR_PATH"

# Pods
PODFILE_HASH=$(hash_file "$REACT_NATIVE_EDITOR_PATH/Podfile.lock")
PODFILE_CACHEKEY="$BUILDKITE_PIPELINE_SLUG-pods-$PLATFORM-$ARCHITECTURE-$PODFILE_HASH"
PODS_FOLDER="Pods"

echo '--- :desktop_computer: Clear up some disk space'
rm -rfv ~/.Trash/15.1.xip

.buildkite/commands/install-node-dependencies.sh

# Generate build key
find package-lock.json \
    gutenberg/packages/react-native-editor/ios \
    gutenberg/packages/react-native-aztec/ios \
    gutenberg/packages/react-native-bridge/ios \
    -type f -print0 | sort -z | xargs -0 shasum | tee ios-checksums.txt
APP_BUILD_HASH=$(hash_file ios-checksums.txt)
APP_BUILD_CACHEKEY="$BUILDKITE_PIPELINE_SLUG-ios-app-$PLATFORM-$ARCHITECTURE-$APP_BUILD_HASH"
WDA_BUILD_CACHEKEY="$BUILDKITE_PIPELINE_SLUG-ios-wda-$PLATFORM-$ARCHITECTURE-$APP_BUILD_HASH"

echo "--- :ios: Restore App build if present"
mkdir -p "$PRODUCTS_PATH"
pushd "$PRODUCTS_PATH"
restore_cache "$APP_BUILD_CACHEKEY"
popd

echo "--- :ios: Restore WDA build if present"
pushd "$BUILD_PATH"
restore_cache "$WDA_BUILD_CACHEKEY"
popd

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
test -e "$APP_PATH/GutenbergDemo" || npm run core test:e2e:build-app:ios

echo '--- :react: Build WDA for E2E testing'
test -d "$BUILD_PATH/WDA" || npm run core test:e2e:build-wda

echo '--- :compression: Prepare artifacts'
# Set the working directory
WORK_DIR=$(pwd)

# Compress the GutenbergDemo.app
pushd "$PRODUCTS_PATH"
zip -r "$WORK_DIR/$REACT_NATIVE_EDITOR_PATH/GutenbergDemo.app.zip" GutenbergDemo.app
popd

# Compress the WDA directory
pushd "$BUILD_PATH/WDA"
zip -r "$WORK_DIR/$REACT_NATIVE_EDITOR_PATH/WDA.zip" ./*
popd

echo "--- :arrow_up: Upload Build"
upload_artifact "$REACT_NATIVE_EDITOR_PATH/GutenbergDemo.app.zip"
upload_artifact "$REACT_NATIVE_EDITOR_PATH/WDA.zip"

echo "--- :cocoapods: Save Pods cache if necessary"
pushd "$PODS_PATH"
save_cache "$PODS_FOLDER" "$PODFILE_CACHEKEY"
popd

echo "--- :ios: Save App build cache if necessary"
# Save app build
rm "$APP_PATH/main.jsbundle"
rm -rf "$APP_PATH/assets"
pushd "$PRODUCTS_PATH"
save_cache "GutenbergDemo.app" "$APP_BUILD_CACHEKEY"
popd

echo "--- :ios: Save WDA build cache if necessary"
pushd "$BUILD_PATH"
save_cache "WDA" "$WDA_BUILD_CACHEKEY"
popd