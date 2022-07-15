FROM debian:stable-slim as base-test-runner

RUN apt-get update \
    && apt-get install -y coreutils curl git php-cli php-mbstring \
    && apt-get -y autoclean

#SHELL ["/bin/bash", "--login", "-c"]

RUN curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh" | bash

WORKDIR /app

# Allow running `wp` as root (which is always the case in Docker)
ENV WP_CLI_ALLOW_ROOT=true

#######################
# Gutenberg Test Runner
#
FROM base-test-runner AS gutenberg-test-runner
RUN /bin/bash --login -c "nvm install 14 --default"

#######################
# Android App Builder
#
FROM base-test-runner as android-app-builder

ENV ANDROID_SDK_ROOT="/usr/local/android"
ENV PATH="/usr/local/android/cmdline-tools/latest/bin:${PATH}"

RUN apt update && apt upgrade -y
RUN apt install -y openjdk-11-jdk wget zip \
    && apt-get -y autoclean

# Use a temp version of the command-line tools to bootstrap a permanent installation of them
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-6858069_latest.zip \
    && unzip commandlinetools-linux-6858069_latest.zip \
    && rm commandlinetools-linux-6858069_latest.zip \
    && mv cmdline-tools /tmp \
    && yes | /tmp/cmdline-tools/bin/sdkmanager --sdk_root=/usr/local/android 'cmdline-tools;latest' \
    && rm -rf /tmp/cmdline-tools

# Install the bare minimum tools – the others can be downloaded on demand
RUN yes | sdkmanager 'platform-tools'
RUN yes | sdkmanager --licenses
