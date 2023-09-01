#!/bin/bash -eu

# This is what I would have liked to do thanks to the nvm plugin
#
# echo '--- :npm: Setup Node dependencies'
# npm ci
#
# This is what I need to do to achive the same result without it
echo '--- :node: Setup Node depenendencies'
echo '--- :node: 1. Install nvm'
brew install nvm

echo '--- :node: 2. Load nvm in the current shell'
export NVM_DIR="$HOME/.nvm"
mkdir -p "$NVM_DIR"
[ -s "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" ] && \. "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" --install

echo '--- :node: 3. Install node version from .nvmrc'
nvm install "$(cat .nvmrc)" && nvm use

echo '--- :node: 4. nmp ci (for E2E testing)'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=sauce
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/ios-test-results.xml"
# Set a destination different from the hardcoded one which only works in the
# older Xcode-setup used by CircleCI
export RN_EDITOR_E2E_IOS_DESTINATION='platform=iOS Simulator,name=iPhone 13,OS=16.4'
set +x

# TODO: Skipping to see if they're not necessary
echo '--- :file-folder: Make folders for E2E testing reports'
set -x
# mkdir __device-tests__/image-snapshots/diff
# mkdir reports
# mkdir reports/test-results
set +x

echo '--- :react: Test iOS Canary Pages'
npm run device-tests-canary
