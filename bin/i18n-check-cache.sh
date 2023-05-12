#!/bin/bash
# 
# Checks i18n cache folders in order to guarantee that translations are present for provided plugins.
# A cache folder will be created, in case a plugin doesn't have it, with its translations that 
# will be fetched before creation.
#
# NOTE: The translations fetched are NOT OPTIMIZED, the reason for this is purely for making
# the script fast as it will be mainly used upon dependency installation.

# Exit if any command fails
set -euo pipefail

function error() {
  echo -e "\033[0;31m$1\033[0m"
  exit 1
}

function arrayLength() { echo "$#"; }

function check_plugin_cache() {
  local plugin_name=$1
  local project_slug=$2
  local i18n_cache_folder="$TRANSLATIONS_OUTPUT_PATH/$plugin_name"

  if [[ ! -d $i18n_cache_folder ]]; then
    NOT_FOUND_PLUGIN_I18N_CACHE+=( $i18n_cache_folder )
    echo -e "Couldn't find i18n cache folder (\"$i18n_cache_folder\") for plugin \"$plugin_name\", downloading un-optimized translations for creating the cache."
    fetch_translations "$plugin_name" "$project_slug" "$TRANSLATIONS_OUTPUT_PATH"
  fi
}

function update_gutenberg_i18n_cache() {
  local output_path=$1

  echo "Update \"react-native-editor\" package i18n cache"
  cp -r "$output_path/gutenberg/data" gutenberg/packages/react-native-editor/i18n-cache
  cp "$output_path/gutenberg/index.js" gutenberg/packages/react-native-editor/i18n-cache/index.native.js
}

function fetch_translations() {
  local plugin_name=$1
  local project_slug=$2
  local output_path=$3

  echo -e "\n\033[1mDownload I18n translations for \"$plugin_name\" plugin\033[0m"
  node gutenberg/packages/react-native-editor/bin/i18n-translations-download "$plugin_name" "$project_slug" "$output_path"
}

# Get parameters
PLUGINS=( "$@" )

# Define constants
TRANSLATIONS_OUTPUT_PATH="src/i18n-cache"

echo -e "\n\033[1m== Checking i18n cache ==\033[0m"

# Check plugins cache
for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
  PLUGIN_NAME=${PLUGINS[index]}
  PROJECT_SLUG=${PLUGINS[index+1]}
  check_plugin_cache "$PLUGIN_NAME" "$PROJECT_SLUG"
done

# Check Gutenberg cache
check_plugin_cache "gutenberg" "wp-plugins/gutenberg"

if [[ $(arrayLength "${NOT_FOUND_PLUGIN_I18N_CACHE[@]+"${NOT_FOUND_PLUGIN_I18N_CACHE[@]}"}") -eq 0 ]]; then
  echo -e "i18n cache for provided plugins is present ✅"
fi

# We need to guarantee that i18n cache within react-native-editor package is updated
update_gutenberg_i18n_cache "$TRANSLATIONS_OUTPUT_PATH"