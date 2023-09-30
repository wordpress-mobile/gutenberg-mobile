#!/bin/bash -eu

echo '--- :node: Setup Node depenendencies'
npm ci --unsafe-perm --prefer-offline --no-audit --no-progress

echo "--- :arrow_up: Upload npm cache"
NPM_CACHE_ARCHIVE=npm_home.tar.gz
tar -czvf "$NPM_CACHE_ARCHIVE" -C "$HOME" .npm
buildkite-agent artifact upload "$NPM_CACHE_ARCHIVE"
