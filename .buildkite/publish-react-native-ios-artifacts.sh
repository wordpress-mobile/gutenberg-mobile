#!/bin/bash -eu

# Make Homebrew run a bit faster
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

echo "--- :arrow_down: Download iOS JS bundle"
buildkite-agent artifact download bundle/ios/App.js .

echo "--- :rubygems: Setting up Gems"
cd ./ios-xcframework

install_gems

echo "--- :cocoapods: Setting up Pods"
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
brew install xcbeautify

echo "--- :xcode: Build XCFramework"
./build.sh

# Restore initial the location in the filesystem location
cd ..
