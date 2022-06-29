#!/bin/bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="/var/lib/buildkite-agent/.nvm"
source $NVM_DIR/nvm.sh --install

nvm install
restore_cache "$BUILDKITE_PIPELINE_SLUG-npm-cache"
npm ci --prefer-offline --cache .npm-cache
save_cache .npm-cache "$BUILDKITE_PIPELINE_SLUG-npm-cache"
