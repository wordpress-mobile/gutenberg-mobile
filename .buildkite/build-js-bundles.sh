#!/bin/bash -eu

set -o pipefail

# FIXME: these paths expect the script to be called from the root of the project. Make it agnostic
source .buildkite/compute-cache-key.sh

# Building the dependencies with npm ci is time consuming, even with `~/.npm` already cached in the Docker image
# (see https://github.com/wordpress-mobile/docker-gb-mobile-image/blob/25f008b93f9fe190f76c68f3a9719b45ad99a6cc/Dockerfile#L18-L25)
#
# Before attempting to build, check whether we have a remote cache available.
# We trust that the logic we have in place for caching is comprehensive and precise.
sample_cache_item=$(jq -c '.[0]' .buildkite/caches.json)

sample_folder_to_archive_basedir=$(echo "$sample_cache_item" | jq -r '.folder_to_archive_basedir')
sample_folder_to_archive=$(echo "$sample_cache_item" | jq -r '.folder_to_archive')
sample_key=$(compute_cache_key "$sample_folder_to_archive_basedir" "$sample_folder_to_archive")

if aws s3api head-object --bucket "$CACHE_BUCKET_NAME" --key "$sample_key" > /dev/null 2>&1; then
  echo '--- :white_check_mark: Found cached dependencies. Downloading them...'
  ./buildkite/download-caches.sh
else
  echo '--- :npm: No cached dependencies found. Building them...'
  # Build dependencies with clean install, for deterministic builds.
	npm ci --no-audit --no-progress --unsafe-perm
  # Upload to our cache system
  .buildkite/upload-caches.sh
fi

echo '--- :package: Run bundle prep work'
npm run prebundle:js

echo '--- :android: Build Android bundle'
npm run bundle:android

echo '--- :ios: Build iOS bundle'
npm run bundle:ios
