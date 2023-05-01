#!/bin/bash -eu

cd ./ios-xcframework

echo "--- :rubygems: Setting up Gems"
install_gems

echo "--- :cocoapods: Setting up Pods"
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
# The env vars should make Homebrew run faster
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install xcbeautify

echo "--- :xcode: Build XCFramework"
./build.sh
