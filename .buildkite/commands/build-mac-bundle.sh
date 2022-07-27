#!/bin/bash -eu

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.nvm/nvm.sh --install

nvm install

# make build-ios-for-testing
# make e2e-test-ios
