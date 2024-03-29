#!/bin/bash -eu

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

# First, restore the caches, if any
.buildkite/commands/install-node-dependencies.sh --restore-only
# Second, set up the gutenberg-mobile dependencies without building the i18n cache (--ignore-scripts)
# It takes time and we don't need at this point as we are running the tests on top of something already built.
echo "--- :npm: Install Node dependencies"
npm ci --prefer-offline --no-progress --no-audit --ignore-scripts
# Finally, set up the gutenberg submodule dependencies, bypassed by the step above.
# We need them because some E2E logic lives in gutenberg.
npm ci --prefer-offline --no-progress --no-audit --prefix gutenberg

echo '--- :android: Set env var for Android E2E testing'
set -x
export TEST_RN_PLATFORM=android
export TEST_ENV=sauce
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/android-test-results.xml"
# This is a relic of the CircleCI setup.
# It should be removed once the migration to Buildkite is completed.
export CIRCLE_BRANCH=${BUILDKITE_BRANCH}
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
