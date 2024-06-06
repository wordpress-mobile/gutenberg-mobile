#!/bin/bash -eu

.buildkite/commands/install-node-dependencies.sh

if [ -z "${BUILDKITE_TAG:-}" ]; then
  echo "--- :package: Skip bundle prep work"
else
  echo "--- :package: Run bundle prep work"
  npm run prebundle:js
fi

echo "--- :android: Build Android bundle"
npm run bundle:android

echo "--- :arrow_up: Upload Android bundle and source map artifacts"
buildkite-agent artifact upload bundle/android/App.js
buildkite-agent artifact upload bundle/android/App.composed.js.map

echo "--- :ios: Build iOS bundle"
npm run bundle:ios

echo "--- :arrow_up: Upload iOS bundle and source map artifacts"
buildkite-agent artifact upload bundle/ios/App.js
buildkite-agent artifact upload bundle/ios/App.composed.js.map
tar -czvf ios-assets.tar.gz -C ios-xcframework/Gutenberg/Resources assets/
buildkite-agent artifact upload ios-assets.tar.gz