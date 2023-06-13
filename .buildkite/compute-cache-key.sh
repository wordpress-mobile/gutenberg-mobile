#!/bin/bash

ARCHITECTURE=$(uname -m)
NODE_VERSION=$(node --version)
PACKAGE_HASH=$(hash_file package-lock.json)
export CACHE_KEY="$BUILDKITE_PIPELINE_SLUG-$ARCHITECTURE-node$NODE_VERSION-$PACKAGE_HASH"
