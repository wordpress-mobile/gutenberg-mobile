#!/bin/bash -eu

ARCHITECTURE=$(uname -m)

# Restore Project Cache
PROJECT_NODE_VERSION=$(cat .nvmrc)
PROJECT_PACKAGE_HASH=$(hash_file package-lock.json)
PROJECT_CACHE_KEY="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$PROJECT_NODE_VERSION-$PROJECT_PACKAGE_HASH"
restore_cache "${PROJECT_CACHE_KEY}"

# Restore Gutenberg Cache
GUTENBERG_NODE_VERSION=$(cat gutenberg/.nvmrc)
GUTENBERG_PACKAGE_HASH=$(hash_file gutenberg/package-lock.json)
GUTENBERG_CACHE_KEY="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$GUTENBERG_NODE_VERSION-$GUTENBERG_PACKAGE_HASH"
restore_cache "${GUTENBERG_CACHE_KEY}"

# Restore Jetpack Cache
JETPACK_NODE_VERSION=$(cat jetpack/.nvmrc)
JETPACK_PACKAGE_HASH=$(hash_file gutenberg/pnpm-lock.yaml)
JETPACK_CACHE_KEY="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$JETPACK_NODE_VERSION-$JETPACK_PACKAGE_HASH"
restore_cache "${JETPACK_CACHE_KEY}"

make install-dependencies

save_cache node_modules "${PROJECT_CACHE_KEY}"
save_cache gutenberg/node_modules "${GUTENBERG_CACHE_KEY}"
save_cache .pnpm-store "${JETPACK_CACHE_KEY}"
