# Exit if any command fails
set -uo pipefail

# Function to prompt for single line input
function prompt_single_line_input {
    local input
    read -r input
    echo "$input"
}

# Function to prompt for input with multiline support
function prompt_multiline_input {
    local input=""
    local line

    while IFS= read -r line; do
        # Check if the line is empty (only contains whitespace)
        if [[ -z "${line}" ]]; then
            break
        fi

        input+="$line"$'\n'
    done

    # Remove the trailing newline from the last line
    input=${input%$'\n'}

    echo "$input"
}

# Prompt platform
printf "Enter the platform: "
PLATFORM=$(prompt_single_line_input)
if [[ -z "$PLATFORM" || "$PLATFORM" != "android" && "$PLATFORM" != "ios" ]]; then
    echo "\x1b[31mPlatform is required. The accepted values are 'android' and 'ios'.\x1b[0m"
    exit
fi

# Prompt Gutenberg Mobile version
printf "Enter the Gutenberg Mobile version: "
VERSION=$(prompt_single_line_input)
if [[ -z "$VERSION" ]]; then
    echo "\x1b[31mGutenberg Mobile version is required.\x1b[0m"
    exit
fi

# Prompt stack trace
echo "Enter the stack trace (Press Enter on an empty line to finish):"
STACKTRACE=$(prompt_multiline_input)
if [[ -z "$STACKTRACE" ]]; then
    echo "\x1b[31mStacktrace is required.\x1b[0m"
    exit
fi

TEMPMAP=$(mktemp)
DOWNLOAD_URL="https://github.com/wordpress-mobile/gutenberg-mobile/releases/download/v$VERSION/$PLATFORM-App.js.map"
echo "Downloading source maps for version $VERSION ($PLATFORM)..."
wget -q -O $TEMPMAP $DOWNLOAD_URL

if [ $? -ne 0 ]; then
    echo "\x1b[31mCan't find source map\x1b[0m '$DOWNLOAD_URL'.\n\x1b[33mPlease verify that the GitHub release for version '$VERSION' has the source maps attached:\x1b[0m https://github.com/wordpress-mobile/gutenberg-mobile/releases/tag/v$VERSION"
    exit
else
    echo "Symbolicated stack trace:\n"
    npx metro-symbolicate $TEMPMAP <<< "$STACKTRACE"  
fi