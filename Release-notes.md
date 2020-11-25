# Adding release notes
Release notes are important because they let the users know what has changed since the last time they updates the software. 
With every new release of Gutenberg Mobile the release notes `RELEASE-NOTES.txt` also get rolled in to WordPress-iOS and WordPress-Android release notes.

## Importance to users
In order to keep the release notes as concise as possible we want to make sure that we highlight the most significant changes
to our users. To do that we include a simple flag system.


Please prefix each note that you are adding to `RELEASE-NOTES.txt` with the following. 

    [***] very important → Major new features, significant updates to core flows, or impactful fixes (e.g. a crash that impacts a lot of users) — things our users should be aware of.
    [**] good to have    → Changes our users will probably notice, but doesn’t impact core flows. Most fixes.
    [*] low priority     → Minor enhancements and fixes that address annoyances — things our users can miss.


For example:

    * [***] New block: Verse
    * [**] Tooltip for page template selection buttons
    * [*] Fix button alignment in page templates and make strings consistent

## Noting platform specific changes. 

If you have platform specific changes, iOS or Android only, you can start the release note with `[iOS]` or `[Android]` to 
indicate tha the change only applies the specific platform. 

For example: 

    * [*] [Android] Disable ripple effect for Slider control
    
## Additional info
Release notes also go through editorial before they are shared with the users. So, while adding release notes, we should 
try to err on the side of more details so that the changes can be better summarized. 

Also note that the release notes are currently translated into different languages before they are seen by users.
