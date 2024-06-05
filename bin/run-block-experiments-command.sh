#!/bin/bash
set -Eeuo pipefail

local_run_script="${GBM_LOCAL_BLOCK_EXPERIMENTS_RUN_SCRIPT:-./bin/run-block-experiments-command.sh.local}"

if [ -e "$local_run_script" ]
then
  source "$local_run_script"
  exit 0
fi

# Check if nvm is installed
[ -z "$NVM_DIR" ] && NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

command -v nvm >/dev/null 2>&1 || {
  echo "nvm is not installed or cannot be sourced from $NVM_DIR/nvm.sh. Please verify that "'$NVM_DIR'" points to the .nvm directory."
  exit 1
}

pushd block-experiments

# Set up node requirement for block-experiments
nvm install

# Check if Yarn is installed
if ! command -v yarn &> /dev/null
then
    echo "Yarn is not installed. Setting up Yarn..."
    # Set up Yarn using npx
    npx --silent yarn set version latest
    echo "Yarn has been set up."
else
    echo "Yarn is already installed."
fi

# Install only regular dependencies (excluding devDependencies)
npx --silent yarn install --production --prefer-offline