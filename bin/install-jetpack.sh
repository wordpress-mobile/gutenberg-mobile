#!/bin/bash
set -Eeuo pipefail

if [ -e ./bin/install-jetpack.sh.local ]
then
  source ./bin/install-jetpack.sh.local
  exit 0
fi

# Check if nvm is installed
[ -z "$NVM_DIR" ] && NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

command -v nvm >/dev/null 2>&1 || {
  echo "nvm is not installed or cannot be sourced from $NVM_DIR/nvm.sh. Please verify that "'$NVM_DIR'" points to the .nvm directory."
  exit 1
}

pushd jetpack

# Set up node requirement for Jetpack
unset npm_config_prefix
source "$NVM_DIR/nvm.sh"

nvm install v16.17.0
nvm use v16.17.0
nvm alias default v16.17.0

echo "Printing content of npm config ls -l | grep config"
npm config ls -l | grep config

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")

# Install pnpm 
echo "Installing pnpm 7.13.6 globally"
npm install -g pnpm@7.13.6

echo "Current pnpm:"
pnpm -v

CURRENT_PNPM_PATH=$(which pnpm)

echo "Exporting PNPM variables"
# export PNPM_HOME="/opt/circleci/.nvm/versions/node/v16.17.0/bin"
export PNPM_HOME="/home/circleci/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

echo "PNPM_HOME: $PNPM_HOME"

pnpm env use --global 16
$CURRENT_PNPM_PATH env use --global 16
# pnpm add -g pnpm

# Install Jetpack
echo "Install Jetpack"
pnpm install

popd
