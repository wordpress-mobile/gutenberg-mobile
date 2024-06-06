#!/bin/bash
set -Eeuo pipefail

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
npx --silent yarn install --cwd block-experiments --ignore-engines --production --prefer-offline