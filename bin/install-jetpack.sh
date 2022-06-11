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

echo "Verify npm cache ?"
npm cache verify
echo "Print the latest verion of pnpm"
npx pnpm -v
echo "Now try with no cache"
npx --cache /tmp/empty-cache pnpm -v || echo "npx --cache failed :( "

echo "try installing with out the cache ?"
npm install --cache /tmp/empty-cache -g pnpm

echo "now see what it installed globally"
pnpm -v || echo "pnpm is not installed boo hoo"

exit 1

# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")



cd projects/plugins/jetpack

# npx might prompt to install pnpm at the requested version. Let's just agree and carry on.
yes | npx pnpm install

popd
