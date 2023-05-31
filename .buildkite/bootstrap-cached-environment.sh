#!/bin/bash -eu

source /root/.bashrc

echo "--- :node: Setup Node environment"
nvm install && nvm use

echo "--- :arrow_down: Download .npm cache"
buildkite-agent artifact download npm_cache.tar.gz .
tar --extract --gzip --file=npm_cache.tar.gz --directory=/root

echo "--- :arrow_down: Download src/i18n-cache"
buildkite-agent artifact download i18n_cache.tar.gz .
tar --extract --gzip --file=i18n_cache.tar.gz --directory=.

echo "--- :arrow_down: Download pnpm store"
buildkite-agent artifact download pnpm_cache.tar.gz .
tar --extract --gzip --file=pnpm_cache.tar.gz --directory=/root

echo "--- :bug: Check npm artifacts"
set -x
ls -a /root
ls -a /root/.npm
ls src/i18n-cache
# On a macOS machine, this would be ~/Library/pnpm/store/v3
ls /root/.local/share/pnpm/store/v3
set +x

# echo "--- :npm: Download node_modules"
# buildkite-agent artifact download node_modules.tar.gz .
# tar --extract --gzip --file=node_modules.tar.gz

echo "--- :npm: Fast dependencies install (gutenbreg-mobile)"
npm ci --prefer-offline --no-audit --no-progress

# echo "--- :npm: Fast dependencies install (gutenberg)"
# npm ci --prefix gutenberg --prefer-offline --no-audit

echo "--- :bug: Info ./node_modules/rimraf"
ls ./node_modules/rimraf
