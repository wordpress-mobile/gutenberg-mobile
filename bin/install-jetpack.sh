#!/bin/bash
set -Eeuo pipefail

# Check if nvm is installed
[[ -f ~/.nvm/nvm.sh ]] && . ~/.nvm/nvm.sh

command -v nvm >/dev/null 2>&1 || {
  echo "nvm is not installed or cannot be sourced from ~/.nvm/nvm.sh. Please install nvm and run this script again."
  exit 1
}

pushd jetpack

# Set up node requirement for Jetpack
nvm install

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")

cd projects/plugins/jetpack

# npx might prompt to install pnpm at the requested version. Let's just agree and carry on.
( yes || true ) | npx pnpm@"$pnpm_version" install

popd
