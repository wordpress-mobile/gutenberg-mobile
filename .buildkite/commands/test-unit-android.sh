#!/bin/bash -eu

source /root/.bashrc

echo '--- :node: Setup Node environment'
# TODO: The NVM setup should be something for the Docker image to do
apt-get update
apt-get install -y curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use
nvm install "$(cat .nvmrc)"
nvm install "$(cat jetpack/.nvmrc)"
nvm use

echo '--- :npm: Install Node dependencies'
npm ci --prefer-offline --no-audit

# TODO: Test reporting in Buildkite and Slack

echo '--- :android: Run Android native-editor unit tests'
pushd gutenberg/packages/react-native-editor/android
./gradlew testDebug
popd

echo '--- :android: Run Android native-bridge unit tests'
pushd gutenberg/packages/react-native-bridge/android
./gradlew 'test'
popd
