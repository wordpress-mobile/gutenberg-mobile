#!/bin/bash -eu

cd ./ios-xcframework
install_gems
echo "--- :s3: Uploading XCFramework to S3"
bundle exec fastlane t
