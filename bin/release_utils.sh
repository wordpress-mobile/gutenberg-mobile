#!/bin/bash

# Accepts the repository owner/name (wordpress-mobile/gutenberg-mobile) and returns
# the locally matching remote
function get_remote_name() {
    REPO="$1"
    git remote -v | grep "git@github.com:$REPO.git (push)" | grep -oE '^\S*'
}
