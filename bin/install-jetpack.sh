#!/bin/bash
set -Eeuo pipefail

pushd jetpack

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')


# Restore the public hoisting if running on CI
if [[ -n "${CI:-}" ]]; then
  sed -i '/hoist/d' .npmrc
fi
pushd projects/plugins/jetpack
npx pnpm@"$pnpm_version" install

# Clean up the .npmrc if on CI
if [[ -n "${CI:-}" ]]; then
  git checkout .npmrc
  popd
fi

popd