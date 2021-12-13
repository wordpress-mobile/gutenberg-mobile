#!/bin/bash
set -euo pipefail

echo "GH token| $GITHUB_TOKEN |"

verify_command_version() {
    [[ "$(printf '%s\n' $2 $3 | sort -V | head -n1)" == "$2" ]] && return
    printf "\n${tty_red}%s${tty_reset}\n"  "$1 is unavailable or out of date, please install $1 at or above '$2'"
    false
}

for i in "$@"; do
  case $i in

    --pr=*)
      PR="${i#*=}"
      shift
      ;;

    --title=*)
      TITLE="${i#*=}"
      shift
      ;;

    --body=*)
      BODY="${i#*=}"
      shift
      ;;

    --head-branch=*)
      HEAD_BRANCH="${i#*=}"
      shift
      ;;

    --base-branch=*)
      BASE_BRANCH="${i#*=}"
      shift
      ;;

  esac
done

# verify gh and jq versions
gh_version=$(gh version | tail -1 | xargs basename) 2>/dev/null
! verify_command_version "gh" "v2.2.0" $gh_version; gh_verified=$?

jq_version=$(jq --version 2>/dev/null)
! verify_command_version "jq" "jq-1.6" $jq_version; jq_verified=$?

( [[ $gh_verified -eq "0" ]] || [[ $jq_verified -eq "0" ]] ) && exit 1

BASE_BRANCH=${BASE_BRANCH:-"develop"}

# Try to get workflow info from local pr
local_pr=$(gh pr view ${PR:-} --json='title,headRefName,author,url')
if [[ -n "$local_pr" ]]; then
  TITLE=${TITLE:-"[TESTING] "$(echo $local_pr | jq -r '.title')}
  PR=$(echo $local_pr | jq -r '.url')
  HEAD_BRANCH=${HEAD_BRANCH:-$(echo $local_pr | jq -r '"\(.author.login)/\(.headRefName)"')}
fi

BODY=${BODY:-"Gutenberg Mobile PR: $PR"}

result=$(gh workflow run --repo=jhnstn/WordPress-iOS\
  automated_gutenberg_update.yml \
  -f gutenbergMobileShaOrPrUrl="$PR" \
  -f prTitle="$TITLE" \
  -f prBody="$BODY" \
  -f headBranch="$HEAD_BRANCH" \
  -f baseBranch="$BASE_BRANCH")

echo $result