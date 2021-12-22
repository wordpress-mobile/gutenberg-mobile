#!/bin/bash
set -euo pipefail

tty_red='\033[31m'
tty_green='\033[32m'
tty_reset='\033[0m'
tty_bold='\033[1m'

repo_owner='jhnstn'
confirmed=0
workflow_ref='develop'
show_status=0

for i in "$@"; do
  case $i in
    --pr=*)
      pr="${i#*=}"
      shift
      ;;

    --title=*)
      title="${i#*=}"
      shift
      ;;

    --body=*)
      body="${i#*=}"
      shift
      ;;

    --head-branch=*)
      head_branch="${i#*=}"
      shift
      ;;

    --base-branch=*)
      base_branch="${i#*=}"
      shift
      ;;
    -y)
      confirmed=1
      shift
      ;;

    --auto-confirm)
      confirmed=1
      shift
      ;;

    --workflow-ref=*)
      workflow_ref="${i#*=}"
      shift
      ;;

    --show-status)
      show_status=1
      shift
      ;;

    -s)
      show_status=1
      shift
      ;;

     -h)
        echo "\
        usage: $0 [--pr=] [--title=] [--body=] [--head-branch=] [--base-branch=] [--workflow-ref] [-y|--auto-confirm] [-s|--show-status]

        --pr
            The number or url for the GB mobile PR to sync. Defaults to the PR for the current branch.

        --title
            The title of the PR. Defaults to the title of the PR for the current branch.

        --body
          The body of the PR. Defaults to a link to the PR for the current branch.

        --head-branch
            The head branch for the PR on WordPress iOS. Defaults to the '{GBM pr author}/{ GBM pr head branch}'

        --base-branch
            The base branch for the PR on WordPress iOS. Defaults to 'develop'

        --workflow-ref
            Passed to 'gh workflow run' --ref argument. Defaults to 'develop'

        -y|--auto-confirm
            Automatically confirm the parameters and request the workflow run.

        -s|--show-status
            Show the status of the workflow run.
        " >&2
        exit 0
        ;;
  esac
done

# verify gh version
min_gh_version='v2.2.0'
gh_version=$(gh version | tail -1 | xargs basename) 2>/dev/null
if [[ "$(printf '%s\n' $min_gh_version $gh_version | sort -V | head -n1)" != $min_gh_version ]]; then
    printf "\n${tty_red}gh is unavailable or out of date, please install gh at or above '$min_gh_version'${tty_reset}\n"
    exit 1
fi

# Try to get workflow info from local pr
# Use em dash as a separator
IFS="—" read pr_title pr_head pr_author pr_url \
  < <(gh pr view ${PR:-} \
  --json='title,headRefName,author,url' \
  --jq '"\(.title | sub("—";"--"))—\(.headRefName)—\(.author.login)—\(.url)"')

base_branch=${base_branch:-"develop"}
title=${title:-"[TESTING] $pr_title"}
head_branch=${head_branch:-"$pr_author/$pr_head"}
body=${body:-"Gutenberg Mobile PR: $pr_url"}

echo -e "\
Ready to run automated_gutenberg_update workflow with: \n
  ${tty_green}gutenbergMobileShaOrPrUrl:${tty_reset}\t${tty_bold}$pr_url ${tty_reset}
  ${tty_green}prTitle:${tty_reset}\t\t\t${tty_bold}$title ${tty_reset}
  ${tty_green}headBranch:${tty_reset}\t\t\t${tty_bold}$head_branch ${tty_reset}
  ${tty_green}baseBranch:${tty_reset}\t\t\t${tty_bold}$base_branch ${tty_reset}
  ${tty_green}prBody:${tty_reset}\t\t\t${tty_bold}$body
  "

if [[ "$confirmed" -eq 0 ]]; then
  read -p "$(echo -e "${tty_bold} ${tty_green}Run workflow? ${tty_reset} ${tty_bold}[y/N] ")" -n 1 -r
  echo -e "${tty_reset}"
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e  "\nExiting..."
    exit 0
  fi
fi
echo -e "${tty_reset}"

echo -e "${tty_green}${tty_bold}Queueing workflow...${tty_reset}"

gh workflow run --repo="${repo_owner}/WordPress-iOS"\
  automated_gutenberg_update \
  --ref $workflow_ref \
  -f gutenbergMobileShaOrPrUrl="$pr_url" \
  -f prTitle="$title" \
  -f prBody="$body" \
  -f headBranch="$head_branch" \
  -f baseBranch="$base_branch" | head -n 3
result=$?


if [[ $show_status -ne 0 ]]; then
  echo -e "${tty_green}${tty_bold}Fetching Job..."
  sleep 1
  last_job=$(gh run list  --repo="${repo_owner}/WordPress-iOS" --workflow=automated_gutenberg_update.yml -L 1 | tail -1 )
  job_id=$(echo "$last_job" | awk '{print $(NF-2)}' )
  gh run view --repo="${repo_owner}/WordPress-iOS" $job_id | tail -1
  echo -e "${tty_reset}"
fi