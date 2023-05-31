#!/bin/bash -eu

function pOk() {
  echo "[OK]"
}

function pFail() {
  if [ -n "${1:-}" ]; then
    echo "Message: $1"
  fi
  echo "[KO]"
  exit 1
}

function checkDiff() {
  set +e
  diff=$(git diff)
  set -e
  if [[ $? != 0 ]]; then
    pFail
  elif [[ $diff ]]; then
    echo "$diff"
    pFail "package-lock.json has changed. Please run npm install and commit the diff"
  else
    pOk
  fi
}

# if both env variables are missing then force them to `true`. Otherwise will respect the combination passed externally
if [[ -z "${CHECK_CORRECTNESS:-}" ]] && [[ -z "${CHECK_TESTS:-}" ]] ; then
  CHECK_CORRECTNESS=true
  CHECK_TESTS=true
fi

# if [ "$CHECK_CORRECTNESS" = true ] ; then
#   echo "--- :mag: Check diff"
#   checkDiff

#   echo "--- :eslint: Lint"
#   # Need to build gutenberg packages before linting so that eslint-plugin-import can resolve those.
#   # See https://github.com/WordPress/gutenberg/pull/22088 for more information.
#   cd gutenberg
#   npm run build:packages || pFail
#   cd ..

#   npm run lint || pFail
# fi

# Notice we forward the tests output to a file.
# That's because they generates 70k+ lines and we don't want to pollute the logs like that.
if [ "$CHECK_TESTS" = true ] ; then
  # we'll run the tests twice (once for each platform) if the platform env var is not set
  if [[ -z "${TEST_RN_PLATFORM:-}" ]] ; then
    echo "--- :microscope: :android: Unit tests"
    TEST_RN_PLATFORM=android npm run test --maxWorkers=4 > android-tests-out.log || pFail
    echo "--- :microscope: :ios: Unit tests"
    TEST_RN_PLATFORM=ios npm run test --maxWorkers=4 > ios-tests-out.log || pFail
  else
    echo "--- :microscope: :$TEST_RN_PLATFORM: Unit tests"
    npm run test --maxWorkers=4 > "$TEST_RN_PLATFORM-tests-out.log" || pFail
  fi
fi
