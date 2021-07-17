#!/bin/bash

set -eo pipefail

VERSION=$1

source /scripts/prepare_to_publish_to_s3_params.sh
PREPARE_TO_PUBLISH_TO_S3_PARAMS=$(prepare_to_publish_to_s3_params)

pushd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 PREPARE_TO_PUBLISH_TO_S3_PARAMS :publish
popd

pushd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$VERSION" :react-native-bridge:prepareToPublishToS3 PREPARE_TO_PUBLISH_TO_S3_PARAMS :react-native-bridge:publish
popd
