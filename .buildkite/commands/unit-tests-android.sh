#!/bin/bash -eux

echo "--- :arrow_down Download npm cache"
NPM_CACHE_ARCHIVE=npm_home.tar.gz
buildkite-agent artifact download "$$NPM_CACHE_ARCHIVE" .
tar -xzf "$NPM_CACHE_ARCHIVE" -C "$$HOME"

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint and Unit Tests"
CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=android ./bin/ci-checks-js.sh
