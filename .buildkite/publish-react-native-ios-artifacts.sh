#!/bin/bash -eu

echo "--- :arrow_down: Download iOS JS bundle"
buildkite-agent artifact download bundle/ios/App.js .

echo "--- :rubygems: Setting up Gems"
cd ./ios-xcframework

install_gems

echo "--- :cocoapods: Setting up Pods"
# This should already be set by the Podfile and seems to work locally, but somethog does not work in CI.
# See https://buildkite.com/automattic/gutenberg-mobile/builds/6327#0188fad1-932d-4a37-9d84-811937d8af18/435-455
export REACT_NATIVE_NODE_MODULES_DIR="$PWD/../gutenberg/node_modules"
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
brew install xcbeautify

echo "--- :xcode: Build XCFramework"
./build.sh

echo "--- :s3: Uploading XCFramework to S3"
bundle exec fastlane upload_xcframework_to_s3

# Restore initial the location in the filesystem location
cd ..
