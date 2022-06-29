#!/bin/bash -eu

# Install NVM (and the default node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.nvm/nvm.sh --install

nvm install
nvm alias default $(nvm current)

echo -e "--- :npm: Installing Dependencies"
npm install

echo -e "--- :xcode: Building"
gem install bundler:2.2.27
npm run core test:e2e:build-app:ios

echo -e "--- :package: Packaging"
mkdir -p artifacts
npm run test:e2e:bundle:ios

cp -r gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator/GutenbergDemo.app artifacts/GutenbergDemo.app
zip -vr artifacts/GutenbergDemo.app.zip artifacts/GutenbergDemo.app
