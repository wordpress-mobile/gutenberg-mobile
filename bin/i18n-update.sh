#!/bin/bash
# 
# Handles the process of updating the i18n localizations of plugins, including Gutenberg.
# The main goals of this command are:
#
#   1. Download translation files and optimize them by filtering out the unused strings,
#      previously extracted from the source map files of React Native bundle.
#
#      This step produces the following output files:
#      - src/i18n-translations/{PLUGIN_NAME}/data/{LOCALE}.json     [Translation files]
#      - src/i18n-translations/{PLUGIN_NAME}/data/index.js          [JS file to import translations]
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
set -e

# Get arguments
while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "options:"
      echo "-h, --help                              show brief help"
      echo "-w, --skip-upgrade-wp-cli               skip WP-CLI upgrade"
      echo "-p, --path                              use local path for generating files"
      echo "-u, --skip-extract-used-strings         skip extract used strings"
      echo "-t, --skip-download-translations        skip download translations"
      echo "-l, --skip-localization-strings-files   skip generate localization strings files"
      echo "-d, --debug                             print extra info for debugging"
      exit 0
      ;;
    -w|--skip-upgrade-wp-cli*)
      shift
      SKIP_UPGRADE_WP_CLI='true'
      ;;
    -p|--path*)
      shift
      LOCAL_PATH=$1
      shift
      ;;
    -u|--skip-extract-used-strings*)
      shift
      SKIP_EXTRACT_USED_STRINGS='true'
      ;;
    -t|--skip-download-translations*)
      shift
      SKIP_DOWNLOAD_TRANSLATIONS='true'
      ;;
    -l|--skip-localization-strings-files*)
      shift
      SKIP_LOCALIZATION_STRINGS_FILES='true'
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

# Functions
function join_by { local IFS="$1"; shift; echo "$*"; }

function error() {
  echo -e "\033[0;31m$1\033[0m"
  exit 1
}

function setup_wp_cli() {
  # Install WP-CLI command
  if [[ ! -f "bin/wp-cli.phar" ]]; then
    echo -e "\n\033[1mInstalling WP-CLI\033[0m"
    curl -Ls https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o bin/wp-cli.phar
    chmod +x bin/wp-cli.phar
  fi

  # Upgrade WP-CLI command
  if [[ -z $SKIP_UPGRADE_WP_CLI ]]; then
    echo -e "\n\033[1mUpgrading WP-CLI\033[0m"
    $WP_CLI cli update --nightly --yes
    $WP_CLI --info
  fi
}

function build_gutenberg() {
  echo -e "\n\033[1mBuild Gutenberg packages\033[0m"
  npm run build:gutenberg
}

function generate_bundles() {
  local ENTRY_FILE=$1
  local ANDROID_BUNDLE_OUTPUT=$2
  local ANDROID_SOURCEMAP_OUTPUT=$3
  local IOS_BUNDLE_OUTPUT=$4
  local IOS_SOURCEMAP_OUTPUT=$5

  echo -e "\n\033[1mGenerate Android JS bundle\033[0m"
  npm run rn-bundle -- --platform android --dev false --entry-file "$ENTRY_FILE" --bundle-output "$ANDROID_BUNDLE_OUTPUT" --sourcemap-output "$ANDROID_SOURCEMAP_OUTPUT"
  
  echo -e "\n\033[1mGenerate iOS JS bundle\033[0m"
  npm run rn-bundle -- --platform ios --dev false --entry-file "$ENTRY_FILE" --bundle-output "$IOS_BUNDLE_OUTPUT" --sourcemap-output "$IOS_SOURCEMAP_OUTPUT"
}

function extract_source_from_sourcemap_file() {
  local MAP_FILE=$1
  local TARGET_PATH=$2

  mkdir -p $TARGET_PATH

  echo -e "\n\033[1mExtracting source files from \"$MAP_FILE\" source map file\033[0m"
  node bin/extract-files-from-sourcemap.js $MAP_FILE $TARGET_PATH
}

function generate_pot_files() {
  local OUTPUT_PATH=$1
  local PLUGIN_NAME=$2
  local SOURCE_DIR=$3
  shift 3
  local PLUGINS_TO_SUBTRACT=( $@ )
  local SUBTRACT_POT_FILES=$(join_by , "${@/%/-used.pot}")

  # Define output paths
  local OUTPUT_POT_BLOCKS_FILE="$OUTPUT_PATH/$PLUGIN_NAME-blocks.pot"
  local OUTPUT_POT_USED_ANDROID_FILE="$OUTPUT_PATH/$PLUGIN_NAME-used-android.pot"
  local OUTPUT_POT_USED_IOS_FILE="$OUTPUT_PATH/$PLUGIN_NAME-used-ios.pot"
  local OUTPUT_POT_SOURCE_FILE="$OUTPUT_PATH/$PLUGIN_NAME-source.pot"
  local OUTPUT_POT_SOURCE_ANDROID_FILE="$OUTPUT_PATH/$PLUGIN_NAME-source-android.pot"
  local OUTPUT_POT_SOURCE_IOS_FILE="$OUTPUT_PATH/$PLUGIN_NAME-source-ios.pot"

  local EXCLUDE_FILES="test/*,e2e-tests/*,build/*,build-module/*,build-style/*"

  local DEBUG_PARAM=$([ -z $DEBUG ] && echo "" || echo "--debug")
  local SUBTRACT_PARAM=$([ -z $SUBTRACT_POT_FILES ] && echo "" || echo "--subtract=$SUBTRACT_POT_FILES")
  local DOMAIN_PARAM=$([ "$PLUGIN_NAME" == "gutenberg" ] && echo "--ignore-domain" || echo "--domain=$PLUGIN_NAME")

  local MAKEPOT_COMMAND="$WP_CLI i18n make-pot"

  echo -e "\n\033[1mExtract strings and generate POT files for \"$PLUGIN_NAME\" plugin from \"$SOURCE_DIR\"\033[0m"

  mkdir -p $OUTPUT_PATH

  if [[ -z $SKIP_EXTRACT_USED_STRINGS ]]; then
    if [ -n "$SUBTRACT_POT_FILES" ]; then
      echo "--- Strings from ${PLUGINS_TO_SUBTRACT[@]} plugins will be subtracted ---"
    fi

    echo -e "\nExtract strings from block JSON files:"
    $MAKEPOT_COMMAND $SOURCE_DIR $DEBUG_PARAM --exclude="$EXCLUDE_FILES" --skip-js --skip-php --ignore-domain $OUTPUT_POT_BLOCKS_FILE
    
    echo -e "\nExtract used strings from Android JS bundle:"
    $MAKEPOT_COMMAND $ANDROID_EXTRACT_SOURCE_FILES_PATH $DEBUG_PARAM $SUBTRACT_PARAM $DOMAIN_PARAM $OUTPUT_POT_USED_ANDROID_FILE

    echo -e "\nExtract used strings from iOS JS bundle:"
    $MAKEPOT_COMMAND $IOS_EXTRACT_SOURCE_FILES_PATH $DEBUG_PARAM $SUBTRACT_PARAM $DOMAIN_PARAM $OUTPUT_POT_USED_IOS_FILE
  fi

  if [[ -z $SKIP_LOCALIZATION_STRINGS_FILES ]]; then
    # This POT file is only required for generating the localization strings files
    echo -e "\nExtract strings from non-native JS code:"
    local EXCLUDE_FILES_WITH_NATIVE="$EXCLUDE_FILES,*.native.js,*.ios.js,*.android.js,bundle/*"
    $MAKEPOT_COMMAND $SOURCE_DIR $DEBUG_PARAM --exclude="$EXCLUDE_FILES_WITH_NATIVE" --merge="$OUTPUT_POT_BLOCKS_FILE" --skip-php $DOMAIN_PARAM $OUTPUT_POT_SOURCE_FILE

    echo -e "\nExtract strings from Android-specific JS code:"
    $MAKEPOT_COMMAND $SOURCE_DIR $DEBUG_PARAM --exclude="$EXCLUDE_FILES" --include="*.native.js,*.android.js" --skip-php --subtract="$OUTPUT_POT_SOURCE_FILE" $DOMAIN_PARAM $OUTPUT_POT_SOURCE_ANDROID_FILE

    echo -e "\nExtract strings from iOS-specific JS code:"
    $MAKEPOT_COMMAND $SOURCE_DIR $DEBUG_PARAM --exclude="$EXCLUDE_FILES" --include="*.native.js,*.ios.js" --skip-php --subtract="$OUTPUT_POT_SOURCE_FILE" $DOMAIN_PARAM $OUTPUT_POT_SOURCE_IOS_FILE
  fi
}

function fetch_translations() {
  local PLUGIN_NAME=$1
  local ANDROID_POT_FILE=$2
  local IOS_POT_FILE=$3

  echo -e "\n\033[1mDownload I18n translations for \"$PLUGIN_NAME\" plugin\033[0m"
  node bin/i18n-translations-download.js $PLUGIN_NAME $ANDROID_POT_FILE $IOS_POT_FILE

  if [[ "$PLUGIN_NAME" == "gutenberg" ]]; then
    echo "Update \"react-native-editor\" package i18n cache"
    cp -r src/i18n-translations/gutenberg/data gutenberg/packages/react-native-editor/i18n-cache
    cp src/i18n-translations/gutenberg/index.js gutenberg/packages/react-native-editor/i18n-cache/index.native.js
  fi
}

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
if [[ -n $NOT_FOUND_PLUGIN_FOLDERS ]]; then
  exit 1
fi

# Define constants
WP_CLI="php -d memory_limit=4G bin/wp-cli.phar"

# Set target path
if [[ -n $LOCAL_PATH ]]; then
  TARGET_PATH=$LOCAL_PATH
else
  TARGET_PATH=$(mktemp -d)
fi

# Set JS bundle directory
BUNDLE_DIR="$TARGET_PATH/bundle"
mkdir -p $BUNDLE_DIR

# Set source files extraction directory
EXTRACT_SOURCE_FILES_DIR="$TARGET_PATH/source-files"
mkdir -p $EXTRACT_SOURCE_FILES_DIR

# Set POT files directory
POT_FILES_DIR="$TARGET_PATH/pot-files"
mkdir -p $POT_FILES_DIR

# Define JS bundle paths
BUNDLE_ENTRY_FILE="./index.js"

ANDROID_BUNDLE_DIR="$BUNDLE_DIR/android"
ANDROID_BUNDLE_PATH="$ANDROID_BUNDLE_DIR/App.text.js"
ANDROID_SOURCEMAP_PATH="$ANDROID_BUNDLE_DIR/App.text.js.map"

IOS_BUNDLE_DIR="$BUNDLE_DIR/ios"
IOS_BUNDLE_PATH="$IOS_BUNDLE_DIR/App.js"
IOS_SOURCEMAP_PATH="$IOS_BUNDLE_DIR/App.js.map"

# Define source files extraction paths
ANDROID_EXTRACT_SOURCE_FILES_PATH="$EXTRACT_SOURCE_FILES_DIR/android"
IOS_EXTRACT_SOURCE_FILES_PATH="$EXTRACT_SOURCE_FILES_DIR/ios"

# Setup WP cli
setup_wp_cli

# Generate JS bundle
build_gutenberg
mkdir -p $ANDROID_BUNDLE_DIR
mkdir -p $IOS_BUNDLE_DIR
generate_bundles $BUNDLE_ENTRY_FILE $ANDROID_BUNDLE_PATH $ANDROID_SOURCEMAP_PATH $IOS_BUNDLE_PATH $IOS_SOURCEMAP_PATH

# Extract source from sourcemap files
extract_source_from_sourcemap_file $ANDROID_SOURCEMAP_PATH $ANDROID_EXTRACT_SOURCE_FILES_PATH
extract_source_from_sourcemap_file $IOS_SOURCEMAP_PATH $IOS_EXTRACT_SOURCE_FILES_PATH

# Generate POT files for plugins (i.e. Jetpack)
for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
  PLUGIN_NAME=${PLUGINS[index]}
  PLUGIN_FOLDER=${PLUGINS[index+1]}

  PLUGINS_TO_EXTRACT_FROM_GUTENGERG+=( $PLUGIN_NAME )

  generate_pot_files $POT_FILES_DIR $PLUGIN_NAME $PLUGIN_FOLDER
done

# Generate POT files for Gutenberg
generate_pot_files $POT_FILES_DIR "gutenberg" "./gutenberg/packages" "${PLUGINS_TO_EXTRACT_FROM_GUTENGERG[@]}"

# Download and optimize translations
if [[ -z $SKIP_DOWNLOAD_TRANSLATIONS ]]; then
  # Download translations of plugins (i.e. Jetpack)
  for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
    PLUGIN_NAME=${PLUGINS[index]}

    if [[ -z $SKIP_EXTRACT_USED_STRINGS ]]; then
      ANDROID_POT_FILE="$POT_FILES_DIR/${PLUGIN_NAME/%/-used-android.pot}"
      IOS_POT_FILE="$POT_FILES_DIR/${PLUGIN_NAME/%/-used-ios.pot}"
    fi

    fetch_translations $PLUGIN_NAME $ANDROID_POT_FILE $IOS_POT_FILE
  done

  # Download translations of Gutenberg
  fetch_translations "gutenberg" "$POT_FILES_DIR/gutenberg-used-android.pot" "$POT_FILES_DIR/gutenberg-used-ios.pot"
fi

if [[ -z $SKIP_LOCALIZATION_STRINGS_FILES ]]; then
  echo -e "\n\033[1mGenerating localization strings files\033[0m"

  # Get POT files for each plugin
  POT_SOURCE_ANDROID_FILES=( "$POT_FILES_DIR/gutenberg-source-android.pot" )
  POT_SOURCE_IOS_FILES=( "$POT_FILES_DIR/gutenberg-source-ios.pot" )
  for (( index=0; index<${#PLUGINS[@]}; index+=2 )); do
    PLUGIN_NAME=${PLUGINS[index]}

    POT_SOURCE_ANDROID_FILES+=( "$POT_FILES_DIR/$PLUGIN_NAME-source-android.pot" )
    POT_SOURCE_IOS_FILES+=( "$POT_FILES_DIR/$PLUGIN_NAME-source-ios.pot" )
  done

  ./bin/po2android.js bundle/android/strings.xml "${POT_SOURCE_ANDROID_FILES[@]}"
  ./bin/po2swift.js bundle/ios/GutenbergNativeTranslations.swift "${POT_SOURCE_IOS_FILES[@]}"
fi
