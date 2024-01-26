#!/bin/bash -eu

echo "--- :npm: Set up Node dependencies"
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit --ignore-scripts

echo '--- :android: Set env var for Android E2E testing'
set -x
export TEST_RN_PLATFORM=android
export TEST_ENV=sauce
set +x

echo '--- :arrow_down: Download Android bundle'
buildkite-agent artifact download bundle/android/App.js .

echo '--- :react: Build Android app for E2E testing'
npm run core test:e2e:build-app:android

WORK_DIR=$(pwd)
ARTIFACT_PATH="$WORK_DIR/gutenberg/packages/react-native-editor/android/app/build/outputs/apk/debug/app-debug.apk"

if [[ ! -f $ARTIFACT_PATH ]]; then
  echo '+++ APK not found at expected path'
  echo "Expected path: $ARTIFACT_PATH"
  exit 1
fi

echo '--- :saucelabs: Upload app artifact to SauceLabs'
SAUCE_FILENAME=${BUILDKITE_BRANCH//[\/]/-}
curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  --location \
  --request POST 'https://api.us-west-1.saucelabs.com/v1/storage/upload' \
  --form "payload=@\"$ARTIFACT_PATH\"" \
  --form "name=Gutenberg-$SAUCE_FILENAME.apk" \
  --form 'description="Gutenberg"'
