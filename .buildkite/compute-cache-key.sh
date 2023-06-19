#!/bin/bash -eu

ARCHITECTURE=$(uname -m)
NODE_VERSION=$(node --version)
PACKAGE_HASH=$(hash_file package-lock.json)
# This repo depends on the packages in its gutenberg/ and jetpack/ submodules, too
GUTENBERG_PACKAGE_HASH=$(hash_file gutenberg/package-lock.json)
JETPACK_PACKAGE_HASH=$(hash_file jetpack/pnpm-lock.yaml)
# Hash the three hashes because appended together they would make the key for the tar file too long.
# See https://buildkite.com/automattic/gutenberg-mobile/builds/6151#0188b7a7-887f-4dc8-b363-07363f261c8a/4402-4407
#
# Notice we use hash_file here just to avoid reimplementing the hashing logic.
# This leverages the fact that the command doesn't check for the input being an actual file.
HASH=$(hash_file "$PACKAGE_HASH$GUTENBERG_PACKAGE_HASH$JETPACK_PACKAGE_HASH")

CACHE_KEY_ROOT="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$NODE_VERSION-$HASH"

compute_cache_key() {
  local folder_to_archive_basedir="$1"
  local folder_to_archive="$2"

  local key="$CACHE_KEY_ROOT-${folder_to_archive_basedir//\//-}-${folder_to_archive//\//-}"

  echo "$key"
}
