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

echo '--- :node: Set up Node depenendencies'
npm ci --no-audit --ignore-scripts
npm ci --prefix gutenberg --no-audit

echo '--- :ios: Set env var for iOS E2E testing'
set -x
export TEST_RN_PLATFORM=ios
export TEST_ENV=sauce
export JEST_JUNIT_OUTPUT_FILE="reports/test-results/ios-test-results.xml"
# This is a relic of the CircleCI setup.
# It should be removed once the migration to Buildkite is completed.
export CIRCLE_BRANCH=${BUILDKITE_BRANCH}
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
