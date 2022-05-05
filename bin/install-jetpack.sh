#!/bin/bash
set -Eeuo pipefail

pushd jetpack >/dev/null

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')

# Restore the public hoisting if running on CI
if [[ -n "${CI:-}" ]]; then
  sed -i.bak '/hoist/d' .npmrc
  echo "public-hoist-pattern=['*types*', '@prettier/plugin-*', '*prettier-plugin-*']" >> .npmrc
fi
cd projects/plugins/jetpack
npx pnpm@"$pnpm_version" install

popd >/dev/null