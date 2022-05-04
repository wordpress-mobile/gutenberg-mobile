#!/bin/bash
set -Eeuo pipefail

pushd jetpack/projects/plugins/jetpack >/dev/null

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')


# Restore the public hoisting if running on circle CI
if [[ -n "$CIRCLE_JOB" ]]; then
  # Restore pnpm hoisting
  gwak -i inplace '!/hoist/' .npmrc
  echo "public-hoist-pattern=['*types*', '@prettier/plugin-*', '*prettier-plugin-*']" >> .npmrc
fi

npx pnpm@"$pnpm_version" install

popd >/dev/null