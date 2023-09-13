#!/bin/bash -eu

source /root/.bashrc

MODE="full"
INPUT="${1-}"
while [ "$INPUT" != "" ]; do
    case $INPUT in
        --canary )
            MODE="canary"
            ;;
        * )
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
    INPUT="${1-}"
done

echo '--- :node: Setup Node environment'
# TODO: The NVM setup should be something for the Docker image to do
apt-get update
apt-get install -y curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use
nvm install "$(cat .nvmrc)"
nvm install "$(cat jetpack/.nvmrc)"
nvm use

echo '--- :npm: Install Node dependencies'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit

echo '--- :android: Set env var for Android E2E testing'
set -x
export TEST_RN_PLATFORM=android
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/android-test-results.xml"
export TEST_ENV=sauce
set +x

if [ "$MODE" == 'canary' ]; then
    SECTION='--- :saucelabs: Test Android Canary Pages'
    TESTS_CMD='device-tests-canary'
else
    SECTION='--- :saucelabs: Test Android'
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
