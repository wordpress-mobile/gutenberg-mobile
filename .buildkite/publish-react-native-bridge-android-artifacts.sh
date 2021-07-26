#!/bin/bash

set -euo pipefail

# Retrieve data from previous steps
PUBLISHED_AZTEC_VERSION=`buildkite-agent meta-data get "PUBLISHED_REACT_NATIVE_AZTEC_ANDROID_VERSION"`
buildkite-agent artifact download bundle/android/App.js .

# Move app bundled JS file to the correct location
mkdir -p gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets
cp ./bundle/android/App.js ./gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets/index.android.bundle

# Publish react-native-bridge
cd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$PUBLISHED_AZTEC_VERSION" :react-native-bridge:prepareToPublishToS3 `prepare_to_publish_to_s3_params` :react-native-bridge:publish
