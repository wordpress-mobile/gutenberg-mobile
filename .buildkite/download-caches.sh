#!/bin/bash -eux

set -o pipefail

# FIXME: these paths expect the script to be called from the root of the project. Make it agnostic
.buildkite/compute-cache-key.sh

jq -c '.[]' .buildkite/caches.json | while read -r item; do
  display_name=$(echo "$item" | jq -r '.display_name')
  folder_to_archive=$(echo "$item" | jq -r '.folder_to_archive')
  folder_to_archive_basedir=$(echo "$item" | jq -r '.folder_to_archive_basedir')

  echo "--- :arrow_down: Download $display_name cache"
  pushd "$folder_to_archive_basedir"
  restore_cache "$CACHE_KEY-$folder_to_archive"
  popd
done

# Some of the cache data needs to be connected to the submodule projects.
#
# The npm postinstall hooks normally does that, but we obviously don't run it when using cached data.

echo "--- :pnpm: :jetpack: Setup pnpm symlinks"
./bin/run-jetpack-command.sh 'install --ignore-scripts'

echo "--- :globe_with_meridians: Propagate i18n from local cache to submodules"
./bin/i18n-check-cache.sh
