#!/bin/bash -eu

cd ./ios-xcframework

echo "--- :rubygems: Setting up Gems"
install_gems

echo "--- :cocoapods: Setting up Pods"
install_cocoapods

echo "--- 🚧 Install xcbeautify formatter while not on the VM image"
brew install xcbeautify

./build.sh
