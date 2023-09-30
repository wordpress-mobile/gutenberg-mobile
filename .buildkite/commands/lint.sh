#!/bin/bash -eu

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
