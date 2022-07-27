#!/bin/bash -eu

# Install NVM (and the default node)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.nvm/nvm.sh --install

echo -e "--- :npm: Installing Dependencies"
npm install

echo -e "--- :xcode: Building"
npm run core test:e2e:build-app:ios
