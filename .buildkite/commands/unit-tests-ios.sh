#!/bin/bash -eux

echo "--- :arrow_down Download npm cache (fake)"
echo "No downalod here to see the difference against the Android one"

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint and Unit Tests"
CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=ios ./bin/ci-checks-js.sh
