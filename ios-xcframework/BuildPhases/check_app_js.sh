#!/bin/bash -eu

APP_JS_PATH="../bundle/ios/App.js"

if [[ ! -f "$APP_JS_PATH" ]]; then
  cat <<- ERROR
error: Could not find required $APP_JS_PATH.

Please run the following command to generate the file before building this project:

  npm install && npm run bundle:ios
ERROR
  exit 1
else
  echo "App.js found at $APP_JS_PATH."
fi
