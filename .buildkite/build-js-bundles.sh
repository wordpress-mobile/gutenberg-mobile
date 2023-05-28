#!/bin/bash -eu

source /root/.bashrc

echo "--- :node: Setup Node environment"
nvm install && nvm use

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :package: Run bundle prep work"
npm run prebundle:js

echo "--- :android: Build Android bundle"
npm run bundle:android

echo "--- :arrow_up: Upload Android bundle artifact"
buildkite-agent artifact upload bundle/android/App.js

echo "--- :ios: Build iOS bundle"
npm run bundle:ios

echo "--- :arrow_up: Upload iOS bundle artifact"
buildkite-agent artifact upload bundle/ios/App.js
