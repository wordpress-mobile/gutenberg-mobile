#!/bin/bash -eu

set -o pipefail

# FIXME: these paths expect the script to be called from the root of the project. Make it agnostic
jq -c '.[]' .buildkite/caches.json | while read -r item; do
  display_name=$(echo "$item" | jq -r '.display_name')
  folder_to_archive=$(echo "$item" | jq -r '.folder_to_archive')
  folder_to_archive_basedir=$(echo "$item" | jq -r '.folder_to_archive_basedir')

  echo "--- :arrow_up: Upload $display_name cache"
  pushd "$folder_to_archive_basedir"
  hash=$(hash_directory "$folder_to_archive")
  save_cache "$folder_to_archive" "$hash"
  popd
done
