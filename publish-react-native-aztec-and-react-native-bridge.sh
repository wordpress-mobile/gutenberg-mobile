#!/bin/bash

VERSION=$1

mkdir -p react-native-bridge/build/assets
cp ../../../../bundle/android/App.js ./react-native-bridge/build/assets/index.android.bundle

pushd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 --tag-name="$VERSION" :publish
popd

pushd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$VERSION" :react-native-bridge:prepareToPublishToS3 --tag-name="$VERSION" :react-native-bridge:publish
popd
