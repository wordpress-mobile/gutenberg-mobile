#!/bin/bash -eu

echo "--- :arrow_down: Download iOS JS bundle"
buildkite-agent artifact download bundle/ios/App.js .
buildkite-agent artifact download ios-assets.tar.gz .
mkdir -p ios-xcframework/Gutenberg/Resources
tar -xzvf ios-assets.tar.gz -C ios-xcframework/Gutenberg/Resources/

echo '--- :node: Setup node_modules for RNReanimated'
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
