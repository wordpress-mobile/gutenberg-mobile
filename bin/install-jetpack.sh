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

# Install pnpm 
echo "Installing pnpm $pnpm_version globally"
npm install -g npm
npm install -g pnpm@"$pnpm_version"

echo "Installed Jetpack"
pnpm install

popd
