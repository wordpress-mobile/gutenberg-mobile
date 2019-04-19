#!/bin/sh

# Exit if any command fails
set -e

# Change to the expected directory.
cd "$( dirname $0 )"
cd ..

BINTRAY_REPO="wordpress-mobile/react-native-mirror"
PACKAGE_PATHS=("node_modules/react-native/android/com/facebook/react/react-native" "node_modules/jsc-android/dist/org/webkit/android-jsc")

# Use a temp directory so we don't mess up the project dir
TMP_WORKING_DIRECTORY=$(mktemp -d)

# Yarn install
echo "Running yarn install in '${TMP_WORKING_DIRECTORY}'..."
cp "package.json" "${TMP_WORKING_DIRECTORY}/"
cp "yarn.lock" "${TMP_WORKING_DIRECTORY}/"
cp -Ra "i18n-cache" "${TMP_WORKING_DIRECTORY}/"
cd "${TMP_WORKING_DIRECTORY}"
yarn install --silent

# Find local packages in node_modules/
echo "Getting local package details..."
for PACKAGE_PATH in "${PACKAGE_PATHS[@]}"; do
    ./bin/update_bintray_package.sh "${PACKAGE_PATH}" "${BINTRAY_REPO}"
done
