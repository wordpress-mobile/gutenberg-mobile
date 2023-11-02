#!/bin/bash -e

set -o pipefail

# Using the ':' operator with ':=' to check if a variable is set.
# If the variable is unset or null, the value after ':=' is assigned to it.
: ${IOS_APP_PATH:='./gutenberg/packages/react-native-editor/ios/build/GutenbergDemo/Build/Products/Release-iphonesimulator/GutenbergDemo.app'}
: ${WDA_PATH:='./gutenberg/packages/react-native-editor/ios/build/WDA'}
: ${ANDROID_APP_PATH:='./gutenberg/packages/react-native-editor/android/app/build/outputs/apk/debug/app-debug.apk'}

export IOS_APP_PATH
export WDA_PATH
export ANDROID_APP_PATH

export APPIUM_HOME=~/.appium
export NODE_ENV=test 

# Check for debug mode
if [ "$1" == "--debug" ]; then
    shift # Remove first argument
    node $NODE_DEBUG_OPTION --inspect-brk node_modules/jest/bin/jest --runInBand --detectOpenHandles --verbose --config jest_ui.config.js "$@"
else
    cross-env jest --config ./jest_ui.config.js --maxWorkers 1 "$@"
fi
