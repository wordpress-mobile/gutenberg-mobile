#!/bin/bash -eu

target_plist="$TARGET_BUILD_DIR/$INFOPLIST_PATH"
dsym_plist="$DWARF_DSYM_FOLDER_PATH/$DWARF_DSYM_FILE_NAME/Contents/Info.plist"

version=$("$(dirname "$0")"/get_gutenberg_version)

for plist in "$target_plist" "$dsym_plist"; do
  if [ -f "$plist" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $version" "$plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" "$plist"
  fi
done
