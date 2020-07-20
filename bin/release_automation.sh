#!/bin/bash

# Check that Github CLI is installed
command -v gh >/dev/null || { echo "Error: The Github CLI must be installed."; exit 1; }

# Execute script commands from project's root directory
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_PATH/.."

# Check current branch is develop, master, or release/* branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ ! "$CURRENT_BRANCH" =~ "^develop$|^main$|^release/.*" ]]; then
    echo "Releases should generally only be based on 'develop', 'main', or an earlier release branch."
    echo "You are currently on the '$CURRENT_BRANCH' branch."
    read -p "Are you sure you want to create a release branch from the '$CURRENT_BRANCH' branch? (y/n) " -n 1
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        printf "Aborting release...\n"
        exit 1
    fi
fi

# Confirm branch is clean
[[ -z "$(git status --porcelain)" ]] || { git status; printf "\nUncommitted changes found. Aborting release script...\n"; exit 1; }

# Ask for new version number
CURRENT_VERSION_NUMBER=$(./node_modules/.bin/json -f package.json version)
echo "Current Version Number:$CURRENT_VERSION_NUMBER"
read -p "Enter the new version number: " VERSION_NUMBER

# Insure javascript dependencies are up-to-date
npm ci || { echo "Error: 'npm ci' failed"; echo 1; }

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

# Commit bundle changes
git commit -a -m "Release script: Update bundle for: $VERSION_NUMBER" || { echo "Error: failed to commit changes"; exit 1; }

# Verify before publishing a PR
read -p "This script will now create a PR on Github. Would you like to proceed? (y/n) " -n 1
if [[ $REPLY =~ ^[Yy]$ ]]; then
    printf "\n\nProceeding to create a PR...\n"
else
    printf "\n\nFinishing release script without creating a PR\n"
    exit 1
fi

# Read PR template
PR_TEMPLATE_PATH='.github/PULL_REQUEST_TEMPLATE/release_pull_request.md'
test -f "$PR_TEMPLATE_PATH" || { echo "Error: Could not find PR template at $PR_TEMPLATE_PATH"; exit 1; }
PR_TEMPLATE=$(cat "$PR_TEMPLATE_PATH")

# Replace version number in PR template
PR_BODY=${PR_TEMPLATE//v1.XX.Y/$VERSION_NUMBER}

# Create PR in GitHub
gh pr create -t "Release $VERSION_NUMBER" -b "$PR_BODY" -B main -l "release-process" -d || { echo "Error: Failed to create PR"; exit 1; }
