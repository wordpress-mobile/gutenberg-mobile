#!/bin/bash -eu

echo "--- :arrow_down: Download npm cache"
NPM_CACHE_ARCHIVE="npm_home.tar.gz"
buildkite-agent artifact download "$NPM_CACHE_ARCHIVE" .
tar -xzf "$NPM_CACHE_ARCHIVE" -C "$HOME"

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
