#!/bin/bash -eu

CONFIG_FILE="$(pwd)/gutenberg/packages/react-native-editor/__device-tests__/helpers/device-config.json"
DEVICE_NAME=$(jq -r '.ios.local.deviceName' "$CONFIG_FILE")
DEVICE_TABLET_NAME=$(jq -r '.ios.local.deviceTabletName' "$CONFIG_FILE")

MODE="iphone"
INPUT="${1-}"
while [ "$INPUT" != "" ]; do
    case $INPUT in
        --canary )
            MODE="canary"
            ;;
        --ipad )
            MODE="ipad"
            ;;
        * )
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
    INPUT="${1-}"
done

if [ "$MODE" == 'canary' ]; then
    SECTION='--- :react: Test iOS Canary Pages'
    TESTS_CMD='device-tests-canary'
elif [ "$MODE" == "ipad" ]; then
    SECTION='--- :react: Test iOS iPad'
    DEVICE_NAME=$DEVICE_TABLET_NAME
    TESTS_CMD='device-tests-ipad'
else
    SECTION='--- :react: Test iOS iPhone'
    TESTS_CMD='device-tests'
fi

echo "--- :ios: Start booting up simulator"
xcrun simctl boot "$DEVICE_NAME" &

echo "--- 📦 Downloading Build Artifacts"
export IOS_APP_PATH=./gutenberg/packages/react-native-editor/ios/GutenbergDemo.app.zip
download_artifact "GutenbergDemo.app.zip" "$IOS_APP_PATH"

export WDA_PATH=./gutenberg/packages/react-native-editor/ios/build/WDA
download_artifact "WDA.zip" "$WDA_PATH/WDA.zip"
unzip "$WDA_PATH/WDA.zip" -d "$WDA_PATH"

# First, restore the caches, if any
.buildkite/commands/install-node-dependencies.sh --restore-only
# Second, set up the gutenberg-mobile dependencies without building the i18n cache (--ignore-scripts)
# It takes time and we don't need at this point as we are running the tests on top of something already built.
echo "--- :npm: Install Node dependencies"
npm ci --prefer-offline --no-progress --no-audit --ignore-scripts
# Finally, set up the gutenberg submodule dependencies, bypassed by the step above.
# We need them because some E2E logic lives in gutenberg.
npm ci --prefer-offline --no-progress --no-audit --prefix gutenberg

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=local
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/ios-test-results.xml"
# This is a relic of the CircleCI setup.
# It should be removed once the migration to Buildkite is completed.
export CIRCLE_BRANCH=${BUILDKITE_BRANCH}
set +x

echo "--- :react: Prepare tests setup"
npm run core test:e2e:setup

set +e
echo "$SECTION"
npm run "$TESTS_CMD"
TESTS_EXIT_CODE=$?
set -e

REPORT_SECTION_NAME='🚦 Report Tests Status'
if [[ $TESTS_EXIT_CODE -eq 0 ]]; then
    echo "--- $REPORT_SECTION_NAME"
    echo "npm run $TESTS_CMD passed. 🎉"
else
    echo "+++ $REPORT_SECTION_NAME"
    echo "npm run $TESTS_CMD failed."

    if ! command -v ruby ; then
      echo 'Skipping test reporting because Ruby is not available on this machine.'
      exit $TESTS_EXIT_CODE
    fi

    echo "For more details about the failed tests, check the Buildkite annotation, the logs under the '$SECTION' section and the tests results in the artifacts tab."

    if [[ $BUILDKITE_BRANCH == trunk ]]; then
        annotate_test_failures "$JEST_JUNIT_OUTPUT_FILE" --slack "build-and-ship"
    else
        annotate_test_failures "$JEST_JUNIT_OUTPUT_FILE"
    fi

    exit $TESTS_EXIT_CODE
fi
