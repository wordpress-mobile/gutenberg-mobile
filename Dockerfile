FROM ubuntu as base-test-runner
WORKDIR /app
SHELL ["/bin/bash", "-c"]

ENV NVM_DIR /usr/local/nvm

RUN apt-get update \
    && apt-get install -y curl git \
    && apt-get -y autoclean

RUN mkdir -p "$NVM_DIR" && \
    curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh" | bash

# Gutenberg Test Runner
FROM base-test-runner AS gutenberg-test-runner
RUN source /usr/local/nvm/nvm.sh && nvm install 14 --default

### Jetpack Test Runner
FROM base-test-runner as jetpack-test-runner
RUN source /usr/local/nvm/nvm.sh && nvm install 16.13.2 --default

