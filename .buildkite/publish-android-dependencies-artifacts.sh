#!/bin/bash

set -euo pipefail

cd ./gutenberg/packages/react-native-bridge/android

# Publish Android dependencies
# ./gradlew -PwillPublishAndroidDependenciesBinaries=true \
#     :react-native-gesture-handler:prepareToPublishToS3 `prepare_to_publish_to_s3_params` \
#     :react-native-gesture-handler:publish \
#     :react-native-gesture-reanimated:publish

./gradlew -PwillPublishAndroidDependenciesBinaries=true \
    :react-native-gesture-handler:publishToMavenLocal \
    :react-native-reanimated:publishToMavenLocal && \
ls -R $HOME/.m2/repository/org/wordpress-mobile

# Add meta-data for the published version so we can use it while publishing `react-native-bridge` library
# cat ./build/published-version.txt | buildkite-agent meta-data set "PUBLISHED_ANDROID_DEPENDENCIES_VERSION"