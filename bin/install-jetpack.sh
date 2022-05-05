#!/bin/bash
set -Eeuo pipefail

pushd jetpack

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')

# Remove pnpm hoisting config if on CI
if [[ -n "${CI:-}" ]]; then
  sed -i.bk '/hoist/d' .npmrc
fi

cd projects/plugins/jetpack
npx pnpm@"$pnpm_version" install
cd -

# Retore .npmrc if on CI
if [[ -n "${CI:-}" ]]; then
  mv -f .npmrc.bk .npmrc
fi

popd