#!/bin/bash -eu

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

# This is what I would have liked to do thanks to the nvm plugin
#
# echo '--- :npm: Setup Node dependencies'
# npm ci
#
# This is what I need to do to achive the same result without it
echo '--- :node: Setup Node depenendencies'
echo '--- :node: 1. Install nvm'
brew install nvm

echo '--- :node: 2. Load nvm in the current shell'
export NVM_DIR="$HOME/.nvm"
mkdir -p "$NVM_DIR"
[ -s "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" ] && \. "$HOMEBREW_PREFIX/opt/nvm/nvm.sh" --install

echo '--- :node: 3. Install node version from .nvmrc'
nvm install "$(cat .nvmrc)" && nvm use

echo '--- :node: 4. nmp ci (for E2E testing)'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=sauce
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/ios-test-results.xml"
# Set a destination different from the hardcoded one which only works in the
# older Xcode-setup used by CircleCI
export RN_EDITOR_E2E_IOS_DESTINATION='platform=iOS Simulator,name=iPhone 13,OS=16.4'
# This is implicitly required by the E2E tests, but I don't know here
#
# See the way this build failed:
# https://buildkite.com/automattic/gutenberg-mobile/builds/7081#018a4f1c-848f-4df2-b9e2-670983a7a458
# export SAUCE_FILENAME=${BUILDKITE_BRANCH//[\/]/-}
export CIRCLE_BRANCH=${BUILDKITE_BRANCH}
set +x

# TODO: Skipping to see if they're not necessary
# Update: they don't seem to be necessary.
# See https://buildkite.com/automattic/gutenberg-mobile/builds/7083#_
echo '--- :file_folder: Make folders for E2E testing reports'
set -x
# mkdir __device-tests__/image-snapshots/diff
# mkdir reports
# mkdir reports/test-results
set +x

if [ "$MODE" == 'canary' ]; then
    SECTION='--- :saucelabs: Test iOS Canary Pages'
    TESTS_CMD='device-tests-canary'
elif [ "$MODE" == "ipad" ]; then
    SECTION='--- :saucelabs: Test iOS iPad'
    TESTS_CMD='device-tests-ipad'
else
    SECTION='--- :saucelabs: Test iOS iPhone'
    TESTS_CMD='device-tests'
fi

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
    echo "For more details about the failed tests, check the Buildkite annotation, the logs under the '$SECTION' section and the tests results in the artifacts tab."

    annotate_test_failures "$JEST_JUNIT_OUTPUT_FILE" --slack "build-and-ship"
    exit $TESTS_EXIT_CODE
fi
