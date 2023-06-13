#!/bin/bash -eu

ARCHITECTURE=$(uname -m)
NODE_VERSION=$(node --version)
PACKAGE_HASH=$(hash_file package-lock.json)
# TODO: add gutenberg and jetpack package hashes
CACHE_KEY_ROOT="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$NODE_VERSION-$PACKAGE_HASH"

compute_cache_key() {
  local folder_to_archive_basedir="$1"
  local folder_to_archive="$2"

  local key="$CACHE_KEY_ROOT-${folder_to_archive_basedir//\//-}-${folder_to_archive//\//-}"

  echo "$key"
}
