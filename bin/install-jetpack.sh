#!/bin/bash
set -Eeuo pipefail

pushd jetpack/projects/plugins/jetpack >/dev/null

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')

npx pnpm@$pnpm_version install

popd >/dev/null