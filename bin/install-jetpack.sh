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
nvm install

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")

NPM_PREFIX=$(which npm | sed 's/\/bin\/npm//g')

# Set npm correct prefix
npm config set prefix $NPM_PREFIX

# Install pnpm 
echo "Installing pnpm $pnpm_version globally"
npm install -g pnpm@"$pnpm_version"

echo "get current prefix: $(npm config get prefix)"

echo "Installed Jetpack"
echo "pnpm path: $(which pnpm)"
echo "Circle CI string: $NPM_PREFIX"
pnpm install


popd
