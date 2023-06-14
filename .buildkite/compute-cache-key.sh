#!/bin/bash -eu

ARCHITECTURE=$(uname -m)
NODE_VERSION=$(node --version)
PACKAGE_HASH=$(hash_file package-lock.json)
# This repo depends on the packages in its gutenberg/ and jetpack/ submodules, too
GUTENBERG_PACKAGE_HASH=$(hash_file gutenberg/package-lock.json)
JETPACK_PACKAGE_HASH=$(hash_file jetpack/pnpm-lock.yaml)

CACHE_KEY_ROOT="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$NODE_VERSION-$PACKAGE_HASH-$GUTENBERG_PACKAGE_HASH-$JETPACK_PACKAGE_HASH"

compute_cache_key() {
  local folder_to_archive_basedir="$1"
  local folder_to_archive="$2"

  local key="$CACHE_KEY_ROOT-${folder_to_archive_basedir//\//-}-${folder_to_archive//\//-}"

  echo "$key"
}
