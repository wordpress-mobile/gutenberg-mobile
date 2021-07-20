#!/bin/bash

set -euo pipefail

buildkite-agent artifact download bundle/android/App.js .
mkdir -p gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets
cp ./bundle/android/App.js ./gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets/index.android.bundle

PREPARE_TO_PUBLISH_PARAMS=`prepare_to_publish_to_s3_params`

pushd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 "$PREPARE_TO_PUBLISH_PARAMS" :publish
PUBLISHED_REACT_NATIVE_VERSION=`cat ./build/published-version.txt`
popd

pushd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$PUBLISHED_REACT_NATIVE_VERSION" :react-native-bridge:prepareToPublishToS3 "$PREPARE_TO_PUBLISH_PARAMS" :react-native-bridge:publish
