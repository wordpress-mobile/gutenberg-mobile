#!/bin/bash -eu

echo "--- :arrow_down: Download iOS JS bundle"
buildkite-agent artifact download bundle/ios/App.js .
buildkite-agent artifact download ios-assets.tar.gz .
tar -xzvf assets.tar.gz -C ios-xcframework/Gutenberg/Resources/

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
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
brew install xcbeautify

echo "--- :xcode: Build XCFramework"
./build.sh

echo "--- :s3: Uploading XCFramework to S3"
bundle exec fastlane upload_xcframework_to_s3

# Restore initial the location in the filesystem location
cd ..
