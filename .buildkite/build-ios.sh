#!/bin/bash -eu

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
