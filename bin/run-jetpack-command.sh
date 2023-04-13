#!/bin/bash
set -Eeuo pipefail

if [ -e ./bin/run-jetpack-command.sh.local ]
then
  source ./bin/run-jetpack-command.sh.local
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

# Disable `engine-strict` parameter
#
# The `node` version required by Jetpack will be used to install the dependencies. However, we can't
# ensure that the `node` version used by `npm` to check the `engines` parameter is the expected one.
# More information in: https://github.com/wordpress-mobile/gutenberg-mobile/issues/5688
sed -i.bak 's/^engine-strict = true/engine-strict = false/' .npmrc

# npx might prompt to install pnpm at the requested version. Let's just agree and carry on.
( yes || true ) | npx --cache /tmp/empty-cache pnpm@"$pnpm_version" $1

# Revert `engine-strict` parameter back
sed -i.bak 's/^engine-strict = false/engine-strict = true/' .npmrc
rm .npmrc.bak

popd

# Revert to Gutenberg node version
nvm use
