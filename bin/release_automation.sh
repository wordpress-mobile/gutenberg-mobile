#!/bin/bash

# Before creating the release, this script performs the following checks:
# - AztecAndroid and WordPress-Aztec-iOS are set to release versions
# - Release is being created off of either develop, main, or release/*
# - Release is being created off of a clean branch
# - Whether there are any open PRs targeting the milestone for the release

# Execute script commands from project's root directory
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_PATH/.."

source bin/release_prechecks.sh
source bin/release_utils.sh

# Check that Github CLI is installed
command -v gh >/dev/null || { echo "Error: The Github CLI must be installed."; exit 1; }

# Check that Aztec versions are set to release versions
aztec_version_problems="$(check_android_and_ios_aztec_versions)"
if [[ ! -z "$aztec_version_problems" ]]; then
    printf "\nThere appear to be problems with the Aztec versions:\n$aztec_version_problems\n"
    confirm_to_proceed "Do you want to proceed with the release despite the ^above^ problem(s) with the Aztec version?"
else
    echo "Confirmed that Aztec Libraries are set to release versions. Proceeding..."
fi

## Check current branch is develop, main, or release/* branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ ! "$CURRENT_BRANCH" =~ "^develop$|^main$|^release/.*" ]]; then
    echo "Releases should generally only be based on 'develop', 'main', or an earlier release branch."
    echo "You are currently on the '$CURRENT_BRANCH' branch."
    confirm_to_proceed "Are you sure you want to create a release branch from the '$CURRENT_BRANCH' branch?"
fi

# Confirm branch is clean
[[ -z "$(git status --porcelain)" ]] || { git status; printf "\nUncommitted changes found. Aborting release script...\n"; exit 1; }

# Ask for new version number
CURRENT_VERSION_NUMBER=$(./node_modules/.bin/json -f package.json version)
echo "Current Version Number:$CURRENT_VERSION_NUMBER"
read -p "Enter the new version number: " VERSION_NUMBER
if [[ -z "$VERSION_NUMBER" ]]; then
    echo "Version number cannot be empty."
    exit 1
fi

# Insure javascript dependencies are up-to-date
npm ci || { echo "Error: 'npm ci' failed"; echo 1; }


# If there are any open PRs with a milestone matching the release version number, notify the user and ask them if they want to proceed
number_milestone_prs=$(check_if_version_has_pending_prs_for_milestone "$VERSION_NUMBER")
if [[ ! -z "$number_milestone_prs" ]] && [[ "0" != "$number_milestone_prs" ]]; then
    echo "There are currently $number_milestone_prs PRs with a milestone matching $VERSION_NUMBER."
    confirm_to_proceed "Do you want to proceed with cutting the release?"
fi

# Create Git branch
RELEASE_BRANCH="release/$VERSION_NUMBER"
git switch -c "$RELEASE_BRANCH" || { echo "Error: could not create '$RELEASE_BRANCH' branch."; exit 1; }

# Create Git branch in Gutenberg
GB_RELEASE_BRANCH="rnmobile/release_$VERSION_NUMBER"
cd gutenberg
git switch -c "$GB_RELEASE_BRANCH" || { echo "Error: could not create '$GB_RELEASE_BRANCH' branch."; exit 1; }
cd ..

# Set version numbers
for file in 'package.json' 'package-lock.json' 'gutenberg/packages/react-native-editor/package.json'; do
    npx json -I -f "$file" -e "this.version='$VERSION_NUMBER'" || { echo "Error: could not update version in ${file}"; exit 1; }
done

# Commit react-native-editor version update
cd gutenberg
git add 'packages/react-native-editor/package.json'
git commit -m "Release script: Update react-native-editor version to $VERSION_NUMBER" || { echo "Error: failed to commit changes"; exit 1; }
cd ..

# Commit gutenberg-mobile version updates
git add 'package.json' 'package-lock.json'
git commit -m "Release script: Update gb mobile version to $VERSION_NUMBER" || { echo "Error: failed to commit changes"; exit 1; }


# Make sure podfile is updated
PRE_IOS_COMMAND="npm run core preios"
eval "$PRE_IOS_COMMAND"

# If preios results in changes, commit them
cd gutenberg
if [[ ! -z "$(git status --porcelain)" ]]; then
  git commit -a -m "Release script: Update with changes from '$PRE_IOS_COMMAND'" || { echo "Error: failed to commit changes from '$PRE_IOS_COMMAND'"; exit 1; }
else
  echo "There were no changes from '$PRE_IOS_COMMAND' to be committed."
fi
cd ..


# Update the bundles
npm run bundle || { printf "\nError: 'npm bundle' failed.\nIf there is an error stating something like \"Command 'bundle' unrecognized.\" above, perhaps try running 'rm -rf node_modules gutenberg/node_modules && npm install'.\n"; exit 1; }

# Commit bundle changes along with any update to the gutenberg submodule (if necessary)
git commit -a -m "Release script: Update bundle for: $VERSION_NUMBER" || { echo "Error: failed to commit changes"; exit 1; }


#####
# Create PRs
#####

# Verify before creating PRs
echo "This script will now create a Gutenberg-Mobile PR for the $RELEASE_BRANCH branch and a Gutenberg PR for the $GB_RELEASE_BRANCH branch."
read -p "Would you like to proceed? (y/n) " -n 1
if [[ $REPLY =~ ^[Yy]$ ]]; then
    printf "\n\nProceeding to create a PR...\n"
else
    printf "\n\nFinishing release script without creating a PR\n"
    exit 1
fi


#####
# Gutenberg-Mobile PR
#####

# Read GB-Mobile PR template
PR_TEMPLATE_PATH='.github/PULL_REQUEST_TEMPLATE/release_pull_request.md'
test -f "$PR_TEMPLATE_PATH" || { echo "Error: Could not find PR template at $PR_TEMPLATE_PATH"; exit 1; }
PR_TEMPLATE=$(cat "$PR_TEMPLATE_PATH")

# Replace version number in GB-Mobile PR template
PR_BODY=${PR_TEMPLATE//v1.XX.Y/$VERSION_NUMBER}

# Insure PR is created on proper remote
# see https://github.com/cli/cli/issues/800
BASE_REMOTE=$(get_remote_name 'wordpress-mobile/gutenberg-mobile')
git push -u "$BASE_REMOTE" HEAD || { echo "Unable to push to remote $BASE_REMOTE"; exit 1; }

# Create Draft GB-Mobile Release PR in GitHub
GB_MOBILE_PR_URL=$(gh pr create --title "Release $VERSION_NUMBER" --body "$PR_BODY" --base main --label "release-process" --draft)
if [[ $? != 0 ]]; then
    echo "Error: Failed to create Gutenberg-Mobile PR"
    exit 1
fi


#####
# Gutenberg PR
#####

# Get Checklist from Gutenberg PR template
cd gutenberg
GUTENBERG_PR_TEMPLATE_PATH=".github/PULL_REQUEST_TEMPLATE.md"
test -f "$GUTENBERG_PR_TEMPLATE_PATH" || { echo "Error: Could not find PR template at $GUTENBERG_PR_TEMPLATE_PATH"; exit 1; }
# Get the checklist from the gutenberg PR template by removing everything before the '## Checklist:' line
CHECKLIST_FROM_GUTENBERG_PR_TEMPLATE=$(cat "$GUTENBERG_PR_TEMPLATE_PATH" | sed -e/'## Checklist:'/\{ -e:1 -en\;b1 -e\} -ed)

# Construct body for Gutenberg release PR
GUTENBERG_PR_BEGINNING="## Description
Release $VERSION_NUMBER of the react-native-editor and Gutenberg-Mobile.

For more information about this release and testing instructions, please see the related Gutenberg-Mobile PR: $GB_MOBILE_PR_URL"
GUTENBERG_PR_BODY="$GUTENBERG_PR_BEGINNING

$CHECKLIST_FROM_GUTENBERG_PR_TEMPLATE"

# Insure PR is created on proper remote
# see https://github.com/cli/cli/issues/800
GB_BASE_REMOTE=$(get_remote_name 'WordPress/gutenberg')
git push -u "$GB_BASE_REMOTE" HEAD || { echo "Unable to push to remote: $GB_BASE_REMOTE"; exit 1; }

# Create Draft Gutenberg Release PR in GitHub
GUTENBERG_PR_URL=$(gh pr create -t "Mobile Release v$VERSION_NUMBER" -b "$GUTENBERG_PR_BODY" -B master -l 'Mobile App Android/iOS' -d)
if [[ $? != 0 ]]; then
    echo "Error: Failed to create Gutenberg PR"
    exit 1
fi
cd ..

echo "PRs Created"
echo "==========="
printf "Gutenberg-Mobile $GB_MOBILE_PR_URL
Gutenberg $GUTENBERG_PR_URL\n" | column -t
