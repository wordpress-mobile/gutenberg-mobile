#!/bin/bash
set -Eeuo pipefail

cd jetpack/projects/plugins/jetpack

pnpm_version=$(npx -c 'echo "$npm_package_engines_pnpm"')

npx pnpm@$pnpm_version --config.shamefully-hoist=true install