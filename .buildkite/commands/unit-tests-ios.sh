#!/bin/bash -eu

echo "--- :npm: Install Node dependencies"
npm ci --unsafe-perm --no-audit --no-progress

SECTION='--- :node: iOS Unit Tests'
set +e
echo "$SECTION"
CHECK_CORRECTNESS=false CHECK_TESTS=true TEST_RN_PLATFORM=ios ./bin/ci-checks-js.sh
TESTS_EXIT_CODE=$?
set -e

REPORT_SECTION_NAME='🚦 Report Tests Status'
if [[ $TESTS_EXIT_CODE -eq 0 ]]; then
    echo "--- $REPORT_SECTION_NAME"
    echo "iOS tests passed. 🎉"
else
    echo "+++ $REPORT_SECTION_NAME"
    echo "iOS tests failed."

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
