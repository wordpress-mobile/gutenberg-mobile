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

echo '--- :node: Setup Node depenendencies'
npm ci --prefer-offline --no-audit --ignore-scripts
npm ci --prefix gutenberg --prefer-offline --no-audit

echo '--- :ios: Set env var for Android E2E testing'
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
    echo "For more details about the failed tests, check the Buildkite annotation, the logs under the '$SECTION' section and the tests results in the artifacts tab."

    if [[ $BUILDKITE_BRANCH == trunk ]]; then
        annotate_test_failures "$JEST_JUNIT_OUTPUT_FILE" --slack "build-and-ship"
    else
        annotate_test_failures "$JEST_JUNIT_OUTPUT_FILE"
    fi

    exit $TESTS_EXIT_CODE
fi
