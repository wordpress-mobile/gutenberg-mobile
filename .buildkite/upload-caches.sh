#!/bin/bash -eu

set -o pipefail

# FIXME: these paths expect the script to be called from the root of the project. Make it agnostic
source .buildkite/compute-cache-key.sh

jq -c '.[]' .buildkite/caches.json | while read -r item; do
  display_name=$(echo "$item" | jq -r '.display_name')
  folder_to_archive=$(echo "$item" | jq -r '.folder_to_archive')
  folder_to_archive_basedir=$(echo "$item" | jq -r '.folder_to_archive_basedir')

  echo "--- :arrow_up: Upload $display_name cache"
  pushd "$folder_to_archive_basedir"
  key=$(compute_cache_key "$folder_to_archive_basedir" "$folder_to_archive")
  # Force only for one run
  save_cache "$folder_to_archive" "$key" true
  popd
done
