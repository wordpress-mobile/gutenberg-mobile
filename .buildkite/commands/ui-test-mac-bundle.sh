#!/bin/bash -eu

mkdir -p artifacts
buildkite-agent artifact download artifacts/GutenbergDemo.app.zip artifacts/GutenbergDemo.app.zip

curl \
    -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
    -X POST \
    -H "Content-Type: application/octet-stream" \
    "https://saucelabs.com/rest/v1/storage/automattic/Gutenberg-${BUILDKITE_BUILD_ID}.app.zip?overwrite=true" \
    --data-binary @artifacts/GutenbergDemo.app.zip

make e2e-test-ios
