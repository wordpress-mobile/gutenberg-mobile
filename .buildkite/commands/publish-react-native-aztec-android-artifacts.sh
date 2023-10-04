#!/bin/bash

set -euo pipefail

# Publish react-native-aztec
cd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 `prepare_to_publish_to_s3_params` :publish

# Add meta-data for the published version so we can use it while publishing `react-native-bridge` library
cat ./build/published-version.txt | buildkite-agent meta-data set "PUBLISHED_REACT_NATIVE_AZTEC_ANDROID_VERSION"
