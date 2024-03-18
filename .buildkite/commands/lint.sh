#!/bin/bash -eu

.buildkite/commands/install-node-dependencies.sh

echo "--- :node: Lint"
CHECK_CORRECTNESS=true CHECK_TESTS=false ./bin/ci-checks-js.sh
