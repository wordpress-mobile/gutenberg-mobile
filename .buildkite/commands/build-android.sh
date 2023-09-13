#!/bin/bash -eu

source /root/.bashrc

echo '--- :node: Setup Node environment'
# TODO: The NVM setup should be something for the Docker image to do
apt-get update
apt-get install -y curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install && nvm use

echo '--- :npm: Install Node dependencies'
npm ci --prefer-offline --no-audit

echo '--- :android: Set env var for Android E2E testing'
set -x
export TEST_RN_PLATFORM=android
export TEST_ENV=sauce
set +x

echo '--- :react: Bundle Android app for E2E testing'
npm run test:e2e:bundle:android

echo '--- :react: Build APK for Sauce Labs'
npm run core test:e2e:build-app:android

echo '--- :saucelabs: Upload APK to Suace Labs'
SAUCE_FILENAME=${BUILDKITE_BRANCH//[\/]/-}
curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  --location \
  --request POST 'https://api.us-west-1.saucelabs.com/v1/storage/upload' \
  --form 'payload=@"./gutenberg/packages/react-native-editor/android/app/build/outputs/apk/debug/app-debug.apk"' \
  --form "name=Gutenberg-$SAUCE_FILENAME.apk" \
  --form 'description="Gutenberg"'
