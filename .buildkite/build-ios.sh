#!/bin/bash -eu

# This build failed because the git-s3-cache plugin didn't checkout the repo due to finding the env var set
# https://buildkite.com/automattic/gutenberg-mobile/builds/7033#018a447e-aca5-4b07-ba2d-3ea961873d8d
#
# Update: The build where this echo was added failed in the same way.
# https://buildkite.com/automattic/gutenberg-mobile/builds/7034#018a4487-399e-41ed-a6f5-57630ed99763
#
# My next guess is that the problem is with the nvm plugin running before we have a chance to pass the job to the macOS VM
echo '+++ :bug: Check IS_VM_HOST value'
echo "$IS_VM_HOST"

# This is what I would have liked to do thanks to the nvm plugin
#
# echo '--- :npm: Setup Node dependencies'
# npm ci
#
# This is what I need to do to achive the same result without it
echo '--- :node: Setup Node depenendencies'
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

echo '--- :react: Build iOS app for E2E testing'
npm run core test:e2e:build-app:ios

echo '--- :react: Build iOS bundle for E2E testing'
npm run test:e2e:bundle:ios

echo '--- :zip: Prepare artifact for SauceLab upload'
WORK_DIR=$(pwd) \
  && pushd ./gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator \
  && zip -r "$WORK_DIR/gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip" GutenbergDemo.app \
  && popd
