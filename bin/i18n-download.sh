function pFail() {
  if [ -n "$1" ]
  then
    echo "Message: $1"
  fi
  echo "[KO]"
  exit 1
}

if [ -n "${REFRESH_I18N}" ] ; then
  node src/i18n-cache/index.js $1 || pFail
fi
# Overwrite the i18n cache of react-native-editor package
cp -r src/i18n-cache/gutenberg/data gutenberg/packages/react-native-editor/i18n-cache || pFail
cp -r src/i18n-cache/gutenberg/index.native.js gutenberg/packages/react-native-editor/i18n-cache || pFail