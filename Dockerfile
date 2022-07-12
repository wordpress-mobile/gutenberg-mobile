FROM debian:stable-slim as base-test-runner

RUN apt-get update \
    && apt-get install -y curl git php-cli php-mbstring \
    && apt-get -y autoclean

SHELL ["/bin/bash", "--login", "-c"]

RUN curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh" | bash

WORKDIR /app

# Allow running `wp` as root (which is always the case in Docker)
ENV WP_CLI_ALLOW_ROOT=true

# Gutenberg Test Runner
FROM base-test-runner AS gutenberg-test-runner
RUN nvm install 14 --default

### Jetpack Test Runner
FROM base-test-runner as jetpack-test-runner
RUN nvm install 16.13.2 --default
