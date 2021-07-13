#!/bin/bash

set -eo pipefail

VERSION=$1

pushd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 --tag-name="$VERSION" :publish
popd

pushd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$VERSION" :react-native-bridge:prepareToPublishToS3 --tag-name="$VERSION" :react-native-bridge:publish
popd
