#!/bin/sh

# Exit if any command fails
set -e

# Change to the expected directory.
cd "$( dirname $0 )"
cd ..

# Check for cocoapods & jq
command -v pod > /dev/null || ( echo Cocoapods is required to generate podspecs; exit 1 )
command -v jq > /dev/null || ( echo jq is required to generate podspecs; exit 1 )

read -r -p "Enter the commit hash of previous commit. If this is the first-time running this script, enter 0, commit generated files and re-rerun the script and this time use the previous commit hash: " COMMIT_HASH
if [[ -z "$COMMIT_HASH" ]]; then
    abort "Commit hash cannot be empty."
fi

WD=$(pwd)
DEST="${WD}/third-party-podspecs"
NODE_MODULES_DIR="gutenberg/node_modules"

# Generate the external (non-RN podspecs)
EXTERNAL_PODSPECS=$(find "$NODE_MODULES_DIR/react-native/third-party-podspecs" \
                         "$NODE_MODULES_DIR/react-native-svg" \
                         "$NODE_MODULES_DIR/react-native-keyboard-aware-scroll-view" \
                         "$NODE_MODULES_DIR/react-native-safe-area" \
                         "$NODE_MODULES_DIR/react-native-dark-mode" \
                         "$NODE_MODULES_DIR/react-native-get-random-values" -type f -name "*.podspec" -print)

for podspec in $EXTERNAL_PODSPECS
do
    pod=$(basename "$podspec" .podspec)

    echo "Generating podspec for $pod"
    pod ipc spec $podspec > "$DEST/$pod.podspec.json"
done

# Generate the React Native podspecs
# Change to the React Native directory to get relative paths for the RN podspecs
cd "$NODE_MODULES_DIR/react-native"

RN_PODSPECS=$(find * -type f -name "*.podspec" -not -path "third-party-podspecs/*" -not -path "*Fabric*" -print)
TMP_DEST=$(mktemp -d)

for podspec in $RN_PODSPECS
do
    pod=$(basename "$podspec" .podspec)
    path=$(dirname "$podspec")

    echo "Generating podspec for $pod with path $path"
    pod ipc spec $podspec > "$TMP_DEST/$pod.podspec.json"
    cat "$TMP_DEST/$pod.podspec.json" | jq > "$DEST/$pod.podspec.json"

    # Add a "prepare_command" entry to each podspec so that 'pod install' will fetch sources from the correct directory
    # and retains the existing prepare_command if it exists
    prepare_command="TMP_DIR=\$(mktemp -d); mv * \$TMP_DIR; cp -R \"\$TMP_DIR/${path}\"/* ."
    cat "$TMP_DEST/$pod.podspec.json" | jq --arg CMD "$prepare_command" '.prepare_command = "\($CMD) && \(.prepare_command // true)"' > "$DEST/$pod.podspec.json"

    # FBReactNativeSpec needs special treatment because of react-native-codegen code generation
    if [[ "$pod" == "FBReactNativeSpec" ]]; then
        # First move it to its own folder
        mkdir -p "$DEST/FBReactNativeSpec"
        mv "$DEST/FBReactNativeSpec.podspec.json" "$DEST/FBReactNativeSpec"

        # Then we generate FBReactNativeSpec-generated.mm and FBReactNativeSpec.h files.
        # They are normally generated during compile time using a Script Phase in FBReactNativeSpec added via the `use_react_native_codegen` function.
        # This script is inside node_modules/react-native/scripts folder. Since we don't have the node_modules when compiling WPiOS,
        # we're calling the script here manually to generate these files ahead of time.
        CODEGEN_MODULES_OUTPUT_DIR=$DEST/FBReactNativeSpec ./scripts/generate-specs.sh 

        # Removing 'script_phases' that shouldn't be needed anymore.
        # Removing 'prepare_command' that includes additional steps to create intermediate folders to keep generated files which won't be needed.
        # Removing 'source.tag' as we'll use a commit hash from gutenberg-mobile instead.
        TMP_FBReactNativeSpec=$(mktemp)
        jq --arg COMMIT_HASH "$COMMIT_HASH" 'del(.script_phases) | del(.prepare_command) | del(.source.tag) | .source.git = "https://github.com/wordpress-mobile/gutenberg-mobile.git" | .source.commit = $COMMIT_HASH | .source.submodule = "true" | .source_files = "third-party-podspecs/FBReactNativeSpec/**/*.{c,h,m,mm,cpp}"' "$DEST/FBReactNativeSpec/FBReactNativeSpec.podspec.json" > "$TMP_FBReactNativeSpec"
        mv "$TMP_FBReactNativeSpec" "$DEST/FBReactNativeSpec/FBReactNativeSpec.podspec.json"
    fi
done
