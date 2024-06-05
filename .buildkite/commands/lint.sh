#!/bin/bash -eu

# Restore the caches, if any
.buildkite/commands/install-node-dependencies.sh --restore-only
# Set up the gutenberg-mobile dependencies without building the i18n cache (--ignore-scripts)
echo "--- :npm: Install Node dependencies"
npm ci --prefer-offline --no-progress --no-audit --ignore-scripts
# Set up the gutenberg submodule dependencies
npm ci --prefer-offline --no-progress --no-audit --prefix gutenberg --ignore-scripts

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
