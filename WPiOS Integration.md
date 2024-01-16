# WordPress iOS Integration Guide

## How to work with local gutenberg-mobile checkout

The `LOCAL_GUTENBERG` environment variable is useful when you want to iterate on the native iOS code (Swift, Objective-C) in `gutenberg-mobile` while testing it inside the [WPiOS](https://github.com/wordpress-mobile/WordPress-iOS) app. This also includes the case when you update a dependency in `gutenberg-mobile` that includes native code.

The `LOCAL_GUTENBERG` flag sets which JS bundle WPiOS uses. It does not impact which WPiOS run scheme is selected or whether or not Metro is used. When the flag is enabled, the bundle available within the local `gutenberg-mobile` checkout is used. That's why, when using this flag, it is better to run the Metro server or recreate JS bundles in the local `gutenberg-mobile` checkout so that the native and JS code are in sync. 

To use it, you need to set `LOCAL_GUTENBERG` environment variable to the local `gutenberg-mobile` folder relative to the `WPiOS` folder.  
By default `LOCAL_GUTENBERG` is set to `../gutenberg-mobile`.

1. First `cd` into your cloned WPiOS project folder and run `rake dependencies`
2. (a) If `gutenberg-mobile` is at `../gutenberg-mobile` you can directly run:
```sh
LOCAL_GUTENBERG=true bundle exec pod install
```

2. (b) Otherwise pass in the relative `gutenberg-mobile` folder like this:

```sh
LOCAL_GUTENBERG=../../xyz/gutenberg-mobile bundle exec pod install
```

3. Start the metro server in `gutenberg-mobile` with `npm run start:reset`
4. Launch the WPiOS workspace (`.xcworkspace`) in Xcode and run the app
5. You can change any JS files and metro should pick the changes up
6. If you change any native files (Swift, Objective-C, etc.) you should re-run the WPiOS app for the changes to be reflected

## How to test a gutenberg-mobile PR in WPiOS

Assuming that there is no open WPiOS PR:

1. Open `Podfile` in WPiOS project
2. Find the line where gutenberg reference is set like: `gutenberg :tag => 'vX.YY.Z'`
3. Find latest commit hash of the `gutenberg-mobile` PR
4. Replace the gutenberg reference with the commit hash: `gutenberg :commit => '123456789'`
5. Run `bundle exec pod install` inside WPiOS
6. Switch to the relevant branch in `gutenberg-mobile`and start the metro server with `npm run start:reset`
7. Launch the WPiOS workspace (`.xcworkspace`) in Xcode and run the app

**Additionally to share a WPiOS installable build (IPA)**

8. Within `gutenberg-mobile`, stop the metro server and create bundles running `npm run bundle`
9. Commit and push the bundle changes to `gutenberg-mobile`
10. Update the commit hash in the WPiOS Podfile again and run `bundle exec pod install` again
11. Commit and push the changes to `Podfile` and `Podfile.lock`
12. Open a WPiOS PR
13. Manually trigger the installable build CI job by clicking the link in the PR comments

**Additionally to release a alpha version of gutenberg-mobile and update WPiOS PR to use it**

14. Merge the `gutenberg-mobile` PR (make sure the bundles are up-to-date before merging)
15. Tag the merge commit bumping the latest tag's minor version and adding an `-alphaQ` to the end like: `v1.50.0 -> v1.51.0-alpha1`
16. If there's already an alpha, the alpha version could be increased like: `v1.51.0-alpha1` -> `v1.51.0-alpha2`
17. Open the `Podfile` again and update the gutenberg reference to use the new alpha tag: `gutenberg :tag => 'v1.51.0-alpha2'`
18. Run `bundle exec pod install`
19. Commit and push the changes to `Podfile` and `Podfile.lock` 

## How to work with Aztec in WPiOS

1. While running WPiOS, changes can be made directly to the [Aztec iOS](https://github.com/wordpress-mobile/AztecEditor-iOS) codebase.
2. Create a PR directly in the AztecEditor-iOS repository.

**Additionally to share a WPiOS installable build**

> **Note**: These steps are to be considered a fragile hack used for the sole purpose of creating installable builds for testing PRs changes. If the main Aztec version changes in the process creating/testing the installable build, it may fail.

3. In the `gutenberg-mobile` repo, navigate to the `ios-xcframework/Podfile` file and uncomment the following line:

```
# pod 'WordPress-Aztec-iOS', git: 'https://github.com/wordpress-mobile/WordPress-Aztec-iOS.git', commit: ''
```

4. Update the `commit` argument with the latest hash from your open Aztec PR.
5. After changing, run `bundle exec pod install` to update the Podfile.lock.
6. Push the changes to a new `gutenberg-mobile` PR.
7. Next, in the WPiOS repository, follow the [instructions in the WPiOS' Podfile](https://github.com/wordpress-mobile/WordPress-iOS/blob/d7240e17101644dbfb796b37ff848c2441add985/Podfile#L33-L42) to de-comment the lines with a `commit` argument and comment out the default line that points to a tag.
8. Update the `commit` argument to reference the hash from your open PR and push the changes
9. In `Gutenberg/config.yml`, update the commit hash to the `gutenberg-mobile` PR you created.
10. Run `bundle exec pod install`.

**Additionally to incorporate a merged Aztec change**

11. After your Aztec PR has been tested, approved, and merged, go through the steps to draft and publish a new release via [the releases pages](https://github.com/wordpress-mobile/AztecEditor-iOS/releases).
12. In Gutenberg, update the Aztec tag found under `packages/react-native-aztec/RNTAztecView.podspec`.
13. In Gutenberg Mobile, update the Aztec tag found under `ios-xcframework/Podfile`. Remember to update the Gutenberg submodule reference following the change in the previous step.
14. In WPiOS, update the Aztec tag found in the Podfile. Remember to also follow the steps to point to your latest Gutenberg Mobile changes.
