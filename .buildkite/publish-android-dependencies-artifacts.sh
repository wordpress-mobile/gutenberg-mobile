#!/bin/bash

set -euo pipefail

cd ./gutenberg/packages/react-native-bridge/android

NODE_MODULES_PATH='../../../node_modules'

# Publish Android dependencies
./gradlew -PwillPublishAndroidDependenciesBinaries=true \
    :react-native-gesture-handler:prepareToPublishToS3 `prepare_to_publish_to_s3_params` \
    :react-native-gesture-handler:publish
cat "$NODE_MODULES_PATH/react-native-gesture-handler/android/build/published-version.txt" | buildkite-agent meta-data set "PUBLISHED_REACT_NATIVE_GESTURE_HANDLER_VERSION"

./gradlew -PwillPublishAndroidDependenciesBinaries=true \
    :react-native-reanimated:prepareToPublishToS3 `prepare_to_publish_to_s3_params` \
    :react-native-reanimated:publish
cat "$NODE_MODULES_PATH/react-native-reanimated/android/build/published-version.txt" | buildkite-agent meta-data set "PUBLISHED_REACT_NATIVE_REANIMATED_VERSION"