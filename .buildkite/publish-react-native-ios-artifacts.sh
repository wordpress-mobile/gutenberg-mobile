#!/bin/bash -eu

echo "--- :arrow_down: Download iOS JS bundle"
# buildkite-agent artifact download bundle/ios/App.js .
#
# Debug – Bypassing build step and re-using previously built artifact
buildkite-agent artifact download bundle/ios/App.js . \
  --build 01891ac3-f25f-403f-9eb6-01347448c3d3 \
  --step 01891ac4-37fb-4760-b6bd-90222f1be3c1

echo '--- :node: Setup node_modules for RNReanimated'
echo '--- :node: 1. Install nvm'
brew install nvm

echo '--- :node: 2. Load nvm in the current shell'
export NVM_DIR="$HOME/.nvm"
mkdir -p "$NVM_DIR"
[ -s "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" ] && \. "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" --install

echo '--- :node: 3. Install node version from .nvmrc'
nvm install "$(cat .nvmrc)" && nvm use

echo '--- :node: 4. nmp ci'
npm ci

echo "--- :rubygems: Setting up Gems"
cd ./ios-xcframework

install_gems

echo "--- :cocoapods: Setting up Pods"
# This should already be set by the Podfile and seems to work locally, but somethog does not work in CI.
# See https://buildkite.com/automattic/gutenberg-mobile/builds/6327#0188fad1-932d-4a37-9d84-811937d8af18/435-455
export REACT_NATIVE_NODE_MODULES_DIR="$PWD/../gutenberg/node_modules"
export HERMES_ENABLED='false'
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
brew install xcbeautify

echo "--- :xcode: Build XCFramework"
./build.sh

echo "--- :s3: Uploading XCFramework to S3"
bundle exec fastlane upload_xcframework_to_s3

# Restore initial the location in the filesystem location
cd ..
