#!/bin/bash
# TODO: Get the workflow running for tag pushes.
# Gutenberg Mobile AKA "GBM".
# WordPress-Android AKA "WPA".
# GitHub AKA "GH".

help() {
   echo "Creates a WordPress-Android (WPA) PR containing changes from Gutenberg Mobile (GBM)."
   echo "The GBM changes can be from a GBM PR or from a GBM Tag."
   echo "Should you provide a GBM PR ID, we will fetch the HEAD Commit SHA of the GBM Branch. You can also provide one."
   echo "Should you provide a GBM Tag, a GBM PR ID and Commit SHA are NOT required. The GBM Tag will indicate the Commit SHA."
   echo
   echo "Syntax: script [--help|--pr|--sha|--tag|--token|--title]"
   echo "FLAGS"
   echo "--help   Print this Help."
   echo "--pr     GBM PR, e.g., '1337'."
   echo "--sha    GBM PR HEAD Commit SHA, e.g., '99ed3833e69e4bcf6ee930870661f06c32eb9dd2'."
   echo "--tag    GBM Tag, e.g., 'v1.68.0'."
   echo "--token  GH Token, e.g., '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'."
   echo "--title  WPA PR Title, e.g., 'This isn't confusing at all!'."
   echo
}

needJq() {
  command -v jq >/dev/null || abort "Error: 'jq' is missing. Please 'brew install jq'."
}

needGh() {
  command -v gh >/dev/null || abort "Error: 'gh' is missing. Please 'brew install gh'."
}

abort() {
    printf "%s" "$1"
    exit 1
}

for i in "$@"; do
  case $i in
    --help)
      help
      exit 0
      ;;
    --pr=*)
      GBM_PR="${i#*=}"
      shift
      ;;
    --sha=*)
      GBM_PR_SHA="${i#*=}"
      shift
      ;;
    --tag=*)
      GBM_TAG="${i#*=}"
      shift
      ;;
    --token=*)
      GH_TOKEN="${i#*=}"
      shift
      ;;
    --title=*)
      WPA_PR_TITLE="${i#*=}"
      shift
      ;;
    *)
      ;;
  esac
done

needGh

if [ -n "$GBM_PR" ]
then
  WPA_PR_TITLE="Gutenberg Mobile PR #$GBM_PR"
  GBM_VERSION="$GBM_PR-$GBM_PR_SHA"
  GBM_PR_URL="https://github.com/wordpress-mobile/gutenberg-mobile/pull/$GBM_PR"
elif [ -n "$GBM_TAG" ]
then
  WPA_PR_TITLE="Gutenberg Mobile Release Tag #$GBM_TAG"
  GBM_VERSION="$GBM_TAG"
  GBM_PR_URL="https://github.com/wordpress-mobile/gutenberg-mobile/releases/tag/$GBM_TAG"
else
  abort "Github PR Number OR Gutenberg Tag is REQUIRED to be provided with '--pr=number' or '--tag=tag'."
fi

if [ -z "$GH_TOKEN" ]
then
   # Check that Github CLI is logged
  gh auth status >/dev/null 2>&1 || abort "Error: You are not logged into any GitHub hosts. Run 'gh auth login' to authenticate."
fi

if [ -n "$GBM_PR" ] && [ -z "$GBM_PR_SHA" ]
then
   needJq

   echo "Hello! We're about to take your changes from your PR, $GBM_PR, and integrate them into WordPress Android."
   echo "This should hopefully be useful for smoke testing your current PR changes in an app shell."
   echo

   PR_API_ENDPOINT="https://api.github.com/repos/WordPress-Mobile/gutenberg-mobile/pulls/$GBM_PR"
   PR_DATA=$(curl -s "$PR_API_ENDPOINT")

   # Abort on Empty
   MESSAGE=$(echo "$PR_DATA" | jq -r '.message')

   if [ "$MESSAGE" == 'Not Found' ]
   then
      abort "$MESSAGE - Github PR $GBM_PR_URL doesn't exist. Try again."
   fi

   GBM_PR_TITLE=$(echo "$PR_DATA" | jq -r '.title')
   WPA_PR_TITLE="Gutenberg Mobile PR $GBM_PR '$GBM_PR_TITLE'"
   GBM_PR_SHA=$(echo "$PR_DATA" | jq -r '.head.sha')
   GBM_VERSION="$GBM_PR-$GBM_PR_SHA"

   echo "We found PR, '$GBM_PR_TITLE', with the latest commit, '$GBM_PR_SHA', [here]($GBM_PR_URL)."
   echo
fi

gh workflow run --repo=WordPress-mobile/WordPress-Android automated-version-update-pr.yml \
                -f gutenbergMobileVersion="$GBM_VERSION" \
                -f title="$WPA_PR_TITLE" \
                -f prURL="$GBM_PR_URL"
