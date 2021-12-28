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
      echo "-h, --help    show brief help"
      echo "-p, --path    local path for generating files (by default a temp folder will be used)"
      echo "-d, --debug   print extra info for debugging"
      exit 0
      ;;
    -p|--path*)
      shift
      LOCAL_PATH=$1
      shift
      ;;
    -d|--debug*)
      shift
      DEBUG='true'
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

function fetch_translations() {
  local plugin_name=$1
  local output_path=$2
  local used_strings_file=$3

  echo -e "\n\033[1mDownload I18n translations for \"$plugin_name\" plugin\033[0m"
  node gutenberg/packages/react-native-editor/bin/i18n-translations-download "$plugin_name" "$output_path" "$used_strings_file"

  if [[ "$plugin_name" == "gutenberg" ]]; then
    echo "Update \"react-native-editor\" package i18n cache"
    cp -r $OUTPUT_PATH/gutenberg/data gutenberg/packages/react-native-editor/i18n-cache
    cp $OUTPUT_PATH/gutenberg/index.js gutenberg/packages/react-native-editor/i18n-cache/index.native.js
  fi
}

# Set target path
if [[ -n "${LOCAL_PATH:-}" ]]; then
  TARGET_PATH=$LOCAL_PATH
else
  TARGET_PATH=$(mktemp -d)
fi

# Get parameters
PLUGINS=( "$@" )

echo -e "\n\033[1m== Updating i18n localizations ==\033[0m"

# Validate parameters
if [[ $((${#PLUGINS[@]}%2)) -ne 0 ]]; then
  error "Plugin arguments must be be even."
fi

for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
  PLUGIN_FOLDER=${PLUGINS[index+1]}

  if [[ ! -d $PLUGIN_FOLDER ]]; then
    NOT_FOUND_PLUGIN_FOLDERS+=( $PLUGIN_FOLDER )
    echo -e "\033[0;31mPlugin folder \"$PLUGIN_FOLDER\" doesn't exist.\033[0m"
  fi
done
if [[ -n "${NOT_FOUND_PLUGIN_FOLDERS:-}" ]]; then
  exit 1
fi

# Set used strings target
USED_STRINGS_PATH="$TARGET_PATH/used-strings.json"

# Build Gutenberg
echo -e "\n\033[1mBuild Gutenberg packages\033[0m"
npm run build:gutenberg

# Extract used strings for plugins
METRO_CONFIG="metro.config.js" node gutenberg/packages/react-native-editor/bin/extract-used-strings $USED_STRINGS_PATH "${PLUGINS[@]}"

# Download translations of plugins (i.e. Jetpack)
TRANSLATIONS_OUTPUT_PATH="src/i18n-cache"
for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
  PLUGIN_NAME=${PLUGINS[index]}

  fetch_translations $PLUGIN_NAME $TRANSLATIONS_OUTPUT_PATH $USED_STRINGS_PATH
done

# Download translations of Gutenberg
fetch_translations "gutenberg" $TRANSLATIONS_OUTPUT_PATH $USED_STRINGS_PATH

echo -e "\n\033[1mGenerating localization strings files\033[0m"

# Generate localization strings files
./bin/po2android.js bundle/android/strings.xml $USED_STRINGS_PATH
./bin/po2swift.js bundle/ios/GutenbergNativeTranslations.swift $USED_STRINGS_PATH