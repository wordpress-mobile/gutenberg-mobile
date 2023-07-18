#!/bin/bash -eu

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
