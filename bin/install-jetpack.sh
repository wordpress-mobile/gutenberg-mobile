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
npm cache clean
npm install  pnpm@7.1.1
command -v pnpm >/dev/null 2>&1 || echo "pnpm is not available, not surprised"
npx pnpm@7.1.1 -v || echo "hmm it looks like 7.1.1 is not available ? "


# Set up required pnpm version
listed_pnpm_version=$(npx -c 'echo $npm_package_engines_pnpm')
pnpm_version=$(npx semver -c "$listed_pnpm_version")

cd projects/plugins/jetpack

# npx might prompt to install pnpm at the requested version. Let's just agree and carry on.
npx pnpm@"$pnpm_version" install

popd
