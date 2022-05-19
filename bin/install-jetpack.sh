#!/bin/bash
set -Eeuo pipefail

# Check if nvm is installed
if ! command -v nvm ; then
  source ~/.nvm/nvm.sh &>/dev/null
  if [ $? -ne 0 ]; then
    echo "nvm is not installed or cannot be sourced from ~/.nvm/nvm.sh. Please install nvm and run this script again."
    exit 1
  fi
fi

# Set up node requirement for Jetpack
pushd jetpack

node_version=$(cat .nvmrc)
nvm install "$node_version"
nvm use

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")

cd projects/plugins/jetpack
( yes || true ) | npx pnpm@"$pnpm_version" install

popd
