#!/bin/bash

set -euo pipefail

cd ./gutenberg/packages/react-native-bridge/android

# Install npm dependencies
./gradlew -p android-npm npmInstall

# Publish Android dependencies
# ./gradlew :react-native-gesture-handler:prepareToPublishToS3 `prepare_to_publish_to_s3_params` :react-native-gesture-handler:publish
# ./gradlew :react-native-gesture-reanimated:prepareToPublishToS3 `prepare_to_publish_to_s3_params` :react-native-gesture-reanimated:publish

./gradlew :react-native-gesture-handler:publishToMavenLocal
./gradlew :react-native-gesture-reanimated:publishToMavenLocal
ls -R $HOME/.m2/repository/org/wordpress-mobile
