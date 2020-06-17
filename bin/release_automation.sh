#!/bin/bash

CURRENT_VERSION_NUMBER=$(./node_modules/.bin/json -f package.json version)
echo "Current Version Number:$CURRENT_VERSION_NUMBER"
# Ask for new version number
read -p "Enter the new version number: " VERSION_NUMBER
# Create Git branch
git switch -c release/$VERSION_NUMBER
# Set version number in package.json
yarn json -I -f package.json -e "this.version='$VERSION_NUMBER'"
# Update the bundles
#yarn bundle
# Make sure podfile is updated
pod install --project-directory=./ios/
# Generate updated podspecs
./bin/generate-podspecs.sh
# Commit changes
git commit -a -m "Prepare Release $VERSION_NUMBER"
# Create PR in GitHub
gh pr create -t "Release 1.31.0" -b "$(cat .github/PULL_REQUEST_TEMPLATE/release_pull_request.md)" -B master -l "release-process"