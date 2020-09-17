# Making a release

The `bundle` directory contains the production version of the project's Javascript. This is what the WordPress apps use to avoid having to build Gutenberg.

You can rebuild those files at any time by running

```
npm run bundle
```

This is useful in case you want to use an unreleased version of the bundle in the apps. For instance, on a PR that's a work in progress, you might want to include to a specific gutenberg-mobile branch in the apps with an updated bundle so reviewers can see the latest changes before approving them (and releasing a new version).

# Release Checklist Template

Just copy this checklist and replace all occurrences of `X.XX.X` with the applicable release number, when we are ready to
cut a new release.

```
<!-- wp:heading {"level":1} -->
<h1>Gutenberg Mobile X.XX.X – Release Scenario</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This checklist is based on the <a href="https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/docs/Releasing.md#release-checklist">Release Checklist Template</a>. If you need a checklist for a new gutenberg-mobile release, please copy from that template.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>+mobilegutenberg</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Day 1 - create the release branch, update the version</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o Visit all opened PR's in gutenberg-mobile repo that are assigned to milestone X.XX.X and leave proper message with options to merge them or to bump them to the next version.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Check that <code>RNTAztecView.podspec</code> and <code>gutenberg/packages/react-native-aztec/RNTAztecView.podspec</code> refer to the same Aztec version.
</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o From gutenberg-mobile's <code>develop</code> branch (making sure the gutenberg submodule is updated and clean), run the release script: <code>./bin/release_automation.sh</code>. This will take care of creating the branches in gutenberg-mobile and gutenberg as well as creating the gutenberg-mobile release PR.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Create a new branch in the main WP apps (WordPress-iOS, WordPress-Android) based on their <code>develop</code> branches. Name the new branch <code>gutenberg/integrate_release_X.XX.X</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Use the commit hash of the head of the release branch in Gutenberg-Mobile as the reference for the main apps.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Create a PR in WPAndroid and WPiOS with a description along these lines: "This PR incorporates the X.XX.X release of gutenberg-mobile. For details about the changes included in this PR and testing instructions please see the related gutenberg-mobile PR: [gb-mobile PR link]."</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o In iOS update the file <code>Podfile</code> to point to the new hash in GB-Mobile and if needed also update the reference to Aztec to the new release. Then run <code>rake dependencies</code>, commit and push.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o On Android: (1) update the git submodule reference for <code>libs/gutenberg-mobile</code> (<code>cd libs/gutenberg-mobile &amp;&amp; git checkout release/X.XX.X &amp;&amp; git pull origin release/X.XX.X &amp;&amp; cd .. &amp;&amp; git add gutenberg-mobile</code>); and (2) run <code>python tools/merge_strings_xml.py</code> to update the main <code>strings.xml</code> file.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Create new branches <code>gutenberg/after_X.XX.X</code> in WPAndroid and WPiOS and keep them up to date with the release branches. These are to be doubles for develop on the main apps for mobile gutenberg dev’s WP app PR’s that didn’t or shouldn’t make it into the X.XX.X editor release.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>New Aztec Release</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o Make sure there is no pending Aztec PR required for this Gutenberg release. Check the commit hash referred in the gutenberg repo is in the Aztec <code>develop</code> branch. If it's not, make sure pending PRs are merged before next steps.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Open a PR on Aztec repo to update the <code>CHANGELOG.md</code> and <code>README.md</code> files with the new version name.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Create a new release and name it with the tag name from step 1. For Aztec-iOS, follow <a href="https://github.com/wordpress-mobile/AztecEditor-iOS/blob/develop/Documentation/ReleaseProcess.md">this process</a>. For Aztec-Android, releases are created via the <a href="https://github.com/wordpress-mobile/AztecEditor-Android/releases">GitHub releases page</a> by hitting the “Draft new release” button, put the tag name to be created in the tag version field and release title field, and also add the changelog to the release description. The binary assets (.zip, tar.gz files) are attached automatically after hitting “Publish release”.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>(Optional) Specific tasks after a PR has been merged after the freeze</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o After a merge happened in gutenberg-mobile <code>release/X.XX.X</code> or in gutenberg <code>rnmobile/release-X.XX.X</code>, make sure the <code>gutenberg</code> submodule points to the right hash (and make sure the <code>rnmobile/release-X.XX.X</code> in the gutenberg repo branch has been updated)</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o If there were changes in Gutenberg repo, make sure to cherry-pick the changes that landed in the master branch back to the release branch and don't forget to run <code>npm run bundle</code> in gutenberg-mobile again if necessary.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Add the new change to the "Extra PRs that Landed After the Release Was Cut" section of the gb-mobile PR description.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Last Day</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o Make sure that the bundle files on the Gutenberg-Mobile release branch have been updated to include any changes to the release branch.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Merge the Gutenberg-Mobile PR to main. WARNING: Don’t merge the Gutenberg PR to master at this point.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Tag the head of Gutenberg release branch that the Gutenberg-Mobile release branch is pointing to with the <code>rnmobile/X.XX.X</code> tag.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Create a new GitHub release pointing to the tag: https://github.com/wordpress-mobile/gutenberg-mobile/releases/new?tag=vX.XX.X&target=trunk&title=Release%20X.XX.X. Include a list of changes in the release's description</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o In WPiOS update the reference to point to the <em>tag</em>. For iOS do not forget to remove <code>develop</code> branch reference near 3rd party pod specs if any.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o In WPAndroid, update the submodule to point to the merge commit on GB-Mobile <code>trunk</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Main apps PRs should be ready to merge to their develop now. Merge them or get them merged.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Once everything is merged, ping our friends in #platform9 and let them know we’ve merged our release so everything is right from our side to cut the main app releases.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Open a PR from Gutenberg-Mobile <code>trunk</code> to bring all the <code>release/X.XX.X</code> changes to <code>develop</code> and point to the Gutenberg side PR (if any changes happened specifically for the release). Merge the PR (or PR domino if Gutenberg changes are there)</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>AFTER the main apps have cut their release branches</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o Update the <code>gutenberg/after_X.XX.X</code> branches and open a PR against <code>develop</code>. If the branches are empty we’ll just delete them. The PR can actually get created as soon as something gets merged to the after_X.XX.X branches.&nbsp; Merge the <code>gutenberg/after_X.XX.X</code> PR(s) only AFTER the main apps have cut their release branches.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>You're done</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>o Pass the baton. Ping the dev who is responsible for the next release</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>o Celebrate!</p>
<!-- /wp:paragraph -->
```
