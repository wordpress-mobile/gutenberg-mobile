#!/bin/bash -eu

cd ./ios-xcframework

echo "--- :rubygems: Setting up Gems"
install_gems

echo "--- :cocoapods: Setting up Pods"
install_cocoapods

./build.sh
