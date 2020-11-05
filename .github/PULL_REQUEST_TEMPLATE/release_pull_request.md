Release for Gutenberg Mobile v1.XX.Y

## Related PRs

- Gutenberg: https://github.com/WordPress/gutenberg/pull/
- WPAndroid: https://github.com/wordpress-mobile/WordPress-Android/pull/
- WPiOS: https://github.com/wordpress-mobile/WordPress-iOS/pull/

- Aztec-iOS: https://github.com/wordpress-mobile/AztecEditor-iOS/pull/
- Aztec-Android: https://github.com/wordpress-mobile/AztecEditor-Android/pull

## Extra PRs that Landed After the Release Was Cut

No extra PRs yet. 🎉

## Changes
<!-- To determine the changes you can check the RELEASE-NOTES.txt and gutenberg/packages/react-native-editor/CHANGELOG.md files and cross check with the list of commits that are part of the PR -->

 - Change 1: link-to-pr-describing-change-1
 - Change 2: link-to-pr-describing-change-2

## Test plan

- Use the main WP apps to test the changes above. 
- Smoke test the main WP apps for [general writing flow](https://github.com/wordpress-mobile/test-cases/tree/master/test-cases/gutenberg/writing-flow).

## Release Submission Checklist

- [ ] Approve and run optional Android and iOS UI tests
- [ ] Aztec dependencies are pointing to a stable release.
  - iOS: Aztec dependencies match in `RNTAztecView.podspec` and `gutenberg/packages/react-native-aztec/RNTAztecView.podspec`.
- [ ] Check if `RELEASE-NOTES.txt` and `gutenberg/packages/react-native-editor/CHANGELOG.md` are updated with all the changes that made it to the release.
- [ ] Bundle package of the release is updated.

