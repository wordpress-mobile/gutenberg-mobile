#!/bin/bash -eu

.buildkite/download-caches.sh

echo '--- :package: Run bundle prep work'
npm run prebundle:js

echo '--- :android: Build Android bundle'
npm run bundle:android

echo '--- :ios: Build iOS bundle'
npm run bundle:ios
