#!/bin/bash

set -e

# Update the packages list, just in case
sudo apt update

# Android depends on Java. Luckily, the Ubuntu machine that CircleCI provides
# already includes it. If that wouldn't the case, we'd need to install
# openjdk-11-jdk.

# Install the Android SDK
sudo apt install android-sdk

# The Android SDK gets installed in /usr/lib/. Some of the tools expect the SDK
# location to be available via a known environment variable, so let's export
# it.
export ANDROID_SDK_ROOT=/usr/lib/android-sdk

# Next, we need to install the command line tools to access the sdkmanager tool
# to 1) install the platform and build-tools that the project needs and 2)
# agree to the licenses so we can run the tools.
#
# For some reason, the SDK doesn't come with the command line tools. They are
# not shipped via apt either. We need to download them manually.
#
# You can see what the latest version is at:
# https://developer.android.com/studio#command-tools
#
# See also:
# https://stackoverflow.com/questions/53994924/sdkmanager-command-not-found-after-installing-android-sdk
cmd_line_tools_version=6858069
cmd_line_tools_zip_name="commandlinetools-linux-${cmd_line_tools_version}_latest.zip"
wget https://dl.google.com/android/repository/$cmd_line_tools_zip_name
unzip $cmd_line_tools_zip_name

# Move the command line tools in the location they expect to be in to work.
#
# Alternatively, we could keep them here but then we'd have to pass the
# $ANDROID_SDK_ROOT location to each invocation of the sdkmanager command line
# tool using the --sdk_root option. Doing so would also result in the extra
# platform and build tool we'd install to end up in / rather than in the
# correct subfolder of $ANDROID_SDK_ROOT.
cmdline_tools_root=$ANDROID_SDK_ROOT/cmdline-tools
sudo mkdir $cmdline_tools_root
cmdline_tools_location=$cmdline_tools_root/latest
sudo mv ./cmdline-tools $cmdline_tools_location

# Store the path to sdkmanager for easier access in the rest of the script.
#
# This script is meant to run on a CI machine that gets torn down on every run.
#
# If this was a development machine instead, we would add the whole command line tools bin folder to the path by adding this to the RC file of the shell in use (e.g.: .bashrc or .zshrc):
#
# export PATH=$PATH:$cmdline_tools_location/bin/
sdkmanager_bin=$cmdline_tools_location/bin/sdkmanager

# We need a specific version of the Android platform and build tools.
build_tools_version="29.0.2"
platform_version="28"
yes | sudo $sdkmanager_bin --install "build-tools;$build_tools_version"
yes | sudo $sdkmanager_bin --install "platforms;android-$platform_version"
# Apparently, we also need platform version 29?
# See https://app.circleci.com/pipelines/github/wordpress-mobile/gutenberg-mobile/10739/workflows/a96e43eb-6d64-490e-87ab-ef1f1df2eb1d/jobs/56631
yes | sudo $sdkmanager_bin --install "platforms;android-29"

# Accept the licenses
yes | sudo $sdkmanager_bin --licenses
