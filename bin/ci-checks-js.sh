function pOk() {
  echo "[OK]"
}

function pFail() {
  if [ -n "$1" ]
  then
    echo "Message: $1"
  fi
  echo "[KO]"
  exit 1
}

function checkDiff() {
  diff=$(git diff)
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
if [[ -z "${CHECK_CORRECTNESS}" ]] && [[ -z "${CHECK_TESTS}" ]] ; then
  CHECK_CORRECTNESS=true
  CHECK_TESTS=true
fi

if [ "$CHECK_CORRECTNESS" = true ] ; then
  checkDiff

  # Need to build gutenberg packages before linting so that eslint-plugin-import can resolve those.
  # See https://github.com/WordPress/gutenberg/pull/22088 for more information.
  cd gutenberg
  npm run build:packages || pFail
  cd ..

  npm run lint || pFail
fi

if [ "$CHECK_TESTS" = true ] ; then
  # we'll run the tests twich (once for each platform) if the platform env var is not set
  if [[ -z "${TEST_RN_PLATFORM}" ]] ; then
    TEST_RN_PLATFORM=android npm run test --maxWorkers=4 || pFail
    TEST_RN_PLATFORM=ios npm run test --maxWorkers=4 || pFail
  else
    npm run test --maxWorkers=4 || pFail
  fi
fi
