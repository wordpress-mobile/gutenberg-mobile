#!/bin/bash

# Execute script commands from project's root directory
SCRIPT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$SCRIPT_PATH/.."

function check_num_milestone_prs() {
   MILESTONE_NAME="$1"
   curl -s -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/wordpress-mobile/gutenberg-mobile/milestones" \
      | npx json -c "this.title === '$MILESTONE_NAME'" -a open_issues
}

function check_if_version_has_pending_prs_for_milestone() {
    number_milestone_prs=$(check_num_milestone_prs "$VERSION_NUMBER")
    # If we got no results and the version ends with ".0"
    if [[ -z "$number_milestone_prs" ]] && [[ "$VERSION_NUMBER" =~ [0-9]+\.[0-9]+\.0$ ]]; then
        # Remove the ending ".0" and check again because we usually drop ".0" from our
        # milestones. For example, the milestone for 1.34.0 was 1.34
        version_without_dot_zero=$(echo "$VERSION_NUMBER" | rev | cut -c 3- | rev)
        number_milestone_prs=$(check_num_milestone_prs "$version_without_dot_zero")
    fi
    echo "$number_milestone_prs"
}

