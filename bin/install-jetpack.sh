#!/bin/bash
set -Eeuo pipefail

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


npm view pnpm versions --json
yes | npx pnpm@7.2.0 -v || echo "7.1.1 is not available"
yes | npx pnpm@6 -v || echo "6 is not available"
npx pnpm@6.32.3 -v || echo "6.32.3 is not available???"
npx pnpm -v || echo "can't pull latest pnpm either :( "

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")


corepack enable
corepack prepare pnpm@<version> --activate
cd projects/plugins/jetpack

# npx might prompt to install pnpm at the requested version. Let's just agree and carry on.
yes | npx pnpm@"$major" install

popd
