#!/bin/bash

############################################################
# Help                                                     #
############################################################
help()
{
   # Display Help
   echo "Creates a PR containing changes from a Gutenberg Mobile PR"
   echo
   echo "Syntax: scriptTemplate [-h|b|p]"
   echo "options:"
   echo "h     Print this Help."
   echo "p     Guternberg Mobile PR"
   echo ""
   echo
}

############################################################
# UTILS                                                     #
############################################################

# Takes a single argument, prints it in a colored format and aborts the script
abort() {
    printf "\n${tty_red}%s${tty_reset}\n" "$1"
    exit 1
}

############################################################
# MAIN                                                     #
############################################################
for i in "$@"; do
  case $i in
    -p=*|--pr=*)
      GUTENBERG_MOBILE_PR="${i#*=}"
      shift # past argument=value
      ;;
    -s=*|--sha=*)
      PR_HEAD_COMMIT_SHA="${i#*=}"
      shift # past argument=value
      ;;
    -tag=*|--tag=*)
      TAG_SHA="${i#*=}"
      shift # past argument=value
      ;;
    -t=*|--token=*)
      GITHUB_TOKEN="${i#*=}"
      shift # past argument=value
      ;;
    -e=*|--title=*)
      PR_TITLE="${i#*=}"
      shift # past argument=value
      ;;
    *)
      # unknown option
      ;;
  esac
done
echo "GUTENBERG_MOBILE_PR    = ${GUTENBERG_MOBILE_PR}"
echo "PR_HEAD_COMMIT_SHA     = ${PR_HEAD_COMMIT_SHA}"
echo "GITHUB_TOKEN           = ${GITHUB_TOKEN}"

# tools/create-gutenberg-mobile-pr.sh -b fix/image-block ( )
############################################################
# SETUP                                                    #
############################################################
# Check that Github CLI is installed
command -v gh >/dev/null || abort "Error: The Github CLI must be installed."

if [ -z $PR_HEAD_COMMIT_SHA ]
then
   GUTENBERG_VERSION = "${GUTENBERG_MOBILE_PR}-${PR_HEAD_COMMIT_SHA}"
fi

if [ -z $GITHUB_TOKEN ]
then
   # Check that Github CLI is logged
  gh auth status >/dev/null 2>&1 || abort "Error: You are not logged into any GitHub hosts. Run 'gh auth login' to authenticate."
fi

if [ -z $PR_HEAD_COMMIT_SHA ]
then
   # Check that jq is installed
   command -v jq >/dev/null || abort "Error: 'jq' is missing. Please 'brew install jq'."

   echo "Hello! We're about to take your changes from your PR, $GUTENBERG_MOBILE_PR, and integrate them into WordPress Android."
   echo "This should hopefully be useful for smoke testing your current PR changes in an app shell."
   echo

   PR_URL="https://github.com/wordpress-mobile/gutenberg-mobile/pull/$GUTENBERG_MOBILE_PR"
   PR_API_ENDPOINT="https://api.github.com/repos/WordPress-Mobile/gutenberg-mobile/pulls/$GUTENBERG_MOBILE_PR"
   PR_DATA=$(curl -s $PR_API_ENDPOINT)

   # Abort on Empty
   MESSAGE=$(echo $PR_DATA | jq -r '.message')
   echo $MESSAGE

   if [ $MESSAGE == 'Not Found' ] 
   then
      abort "$MESSAGE - Github PR $PR_URL doesn't exist. Try again."
   fi

   PR_TITLE=$(echo $PR_DATA | jq -r '.title')
   PR_HEAD_COMMIT_SHA=$(echo $PR_DATA | jq -r '.head.sha')
   GUTENBERG_VERSION="$GUTENBERG_MOBILE_PR-$PR_HEAD_COMMIT_SHA"

   echo "We found PR, '$PR_TITLE', with the latest commit, '$PR_HEAD_COMMIT_SHA', [here]($PR_URL)."
   echo
fi



# Workflow creates PR.
gh workflow run --repo=WordPress-mobile/WordPress-Android automated-version-update-pr.yml /
                -f gutenbergMobileVersion="$GUTENBERG_VERSION" title="$PR_TITLE"
