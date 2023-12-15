#!/bin/bash -eu

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo '--- :android: Set env var for Android E2E testing'
set -x
export TEST_RN_PLATFORM=android
export TEST_ENV=sauce
set +x

echo '--- :react: Build Android bundle for E2E testing'
npm run test:e2e:bundle:android

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
