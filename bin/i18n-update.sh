#!/bin/bash
# 
# Handles the process of updating the i18n localizations of plugins, including Gutenberg.
# The main goals of this command are:
#
#   1. Download translation files and optimize them by filtering out the unused strings,
#      previously extracted from the source map files of React Native bundle.
#
#      This step produces the following output files:
#      - src/i18n-cache/{PLUGIN_NAME}/data/{LOCALE}.json     [Translation files]
#      - src/i18n-cache/{PLUGIN_NAME}/data/index.js          [JS file to import translations]
#
#   2. Generate localization strings files that include the strings only used in native JS
#      source code files ("native.js", "ios.js or "android.js"). The translations of these
#      strings are not included in the GlotPress projects of their plugins hence, they require
#      to be requested as part of the main apps’ strings.
#
#      This step produces the following output files:
#      - bundle/android/strings.xml                     [Localization strings files for Android platform]
#      - bundle/ios/GutenbergNativeTranslations.swift   [Localization strings files for iOS platform]

# Exit if any command fails
set -euo pipefail

# Get arguments
while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "options:"
      echo "-h, --help              show brief help"
      echo "-p, --path              local path for generating files (by default a temp folder will be used)"
      exit 0
      ;;
    -p|--path*)
      shift
      LOCAL_PATH=$1
      shift
      ;;
    *)
      break
      ;;
  esac
done

function error() {
  echo -e "\033[0;31m$1\033[0m"
  exit 1
}

function arrayLength() { echo "$#"; }

function check_plugin() {
  local plugin_folder=$1

  if [[ ! -d $plugin_folder ]]; then
    NOT_FOUND_PLUGIN_FOLDERS+=( $plugin_folder )
    echo -e "\033[0;31mPlugin folder \"$plugin_folder\" doesn't exist.\033[0m"
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
  local used_strings_file=$4

  echo -e "\n\033[1mDownload I18n translations for \"$plugin_name\" plugin\033[0m"
  node gutenberg/packages/react-native-editor/bin/i18n-translations-download "$plugin_name" "$project_slug" "$output_path" "$used_strings_file"

  if [[ "$plugin_name" == "gutenberg" ]]; then
    update_gutenberg_i18n_cache "$output_path"
  fi
}

# Set target path
if [[ -n "${LOCAL_PATH:-}" ]]; then
  TARGET_PATH=$LOCAL_PATH
else
  TARGET_PATH=$(mktemp -d)
  trap '{ rm -rf -- "$TARGET_PATH"; }' EXIT
fi

# Get parameters
PLUGINS=( "$@" )

# Define constants
TRANSLATIONS_OUTPUT_PATH="src/i18n-cache"

echo -e "\n\033[1m== Updating i18n localizations ==\033[0m"

# Validate parameters
if [[ $((${#PLUGINS[@]}%3)) -ne 0 ]]; then
  error "Plugin arguments must be supplied as triplets (i.e. domain project-slug path/to/plugin)."
fi

# Check plugins parameters
for (( index=0; index<${#PLUGINS[@]}; index+=3 )); do
  PLUGIN_FOLDER=${PLUGINS[index+2]}

  check_plugin "$PLUGIN_FOLDER"
done

# Check Gutenberg plugin
check_plugin "./gutenberg"

# Stop if can't find any plugin folder
if [[ $(arrayLength "${NOT_FOUND_PLUGIN_FOLDERS[@]+"${NOT_FOUND_PLUGIN_FOLDERS[@]}"}") -gt 0 ]]; then
  exit 1
fi

# Set used strings target
USED_STRINGS_PATH="$TARGET_PATH/used-strings.json"

# Build Gutenberg
echo -e "\n\033[1mBuild Gutenberg packages\033[0m"
npm run build:gutenberg

# Build Jetpack plugins
# - VideoPress package
./bin/run-jetpack-command.sh "-C projects/packages/videopress build"

# Extract used strings for plugins
METRO_CONFIG="metro.config.js" node gutenberg/packages/react-native-editor/bin/extract-used-strings "$USED_STRINGS_PATH" "${PLUGINS[@]}"

# Download translations of plugins (i.e. Jetpack)
for (( index=0; index<${#PLUGINS[@]}; index+=3 )); do
  PLUGIN_NAME=${PLUGINS[index]}
  PROJECT_SLUG=${PLUGINS[index+1]}

  fetch_translations "$PLUGIN_NAME" "$PROJECT_SLUG" "$TRANSLATIONS_OUTPUT_PATH" "$USED_STRINGS_PATH"
done

# Download translations of Gutenberg
fetch_translations "gutenberg" "wp-plugins/gutenberg" "$TRANSLATIONS_OUTPUT_PATH" "$USED_STRINGS_PATH"

echo -e "\n\033[1mGenerating localization strings files\033[0m"

# Generate localization strings files
./bin/strings2android.js bundle/android/strings.xml "$USED_STRINGS_PATH"
./bin/strings2swift.js bundle/ios/GutenbergNativeTranslations.swift "$USED_STRINGS_PATH"