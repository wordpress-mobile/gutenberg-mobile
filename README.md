# Mobile Gutenberg (Gutenberg Day edition)

## Getting Started

### Prerequisites

First, make sure you have the following tools installed:

* git
* [nvm](https://github.com/creationix/nvm) (Don't use brew to install nvm)
* Node.js and npm (use nvm to install them)
* yarn (`npm install -g yarn`)

You can use any text editor for this exercise, you don't need to setup a new project on Android Studio or XCode.
However you will need the Android SDK or XCode installed to be able to build.
Pick the platform you are most familiar with, you'll be using it to test on an emulator or a real device.

* Clone the project and submodules:
```
git clone https://github.com/wordpress-mobile/gutenberg-mobile.git
cd gutenberg-mobile
git checkout gutenberg-day-programming-session
git submodule update --init
```

Before running the demo app, you need to download and install the project dependencies. This is done via the following command:

```
# Making sure everyone uses the same node.js version
nvm install
yarn
```

### Start your development environment

We won't be needing the WordPress native app for this session,
the demo app contained within `gutenberg-mobile` will suffice.

Run the development server using the following command:

`yarn start:reset`

Wait until you see the metro screen:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Running Metro Bundler on port 8081.                                         │
│                                                                              │
│  Keep Metro running while developing on any JS projects. Feel free to        │
│  close this tab and run your own Metro instance if you prefer.               │
│                                                                              │
│  https://github.com/facebook/react-native                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Open another terminal and run
- `yarn android` for Android

or

- `yarn ios` for iOS

> Note: if it does not work call for help!

## Exercise Instructions

The goal of this exercise will be to (re-)create the Star Rating block from Jetpack on mobile.
Take some time to familiarize yourself with this block on the web first.

You can see it in action on [Frontendberg](https://frontenberg.tomjn.com/), just click on the
Inserter icon and pick the "Rating Star" block.

![Screenshot of frontendberg with the block inserter opened on the jetpack section and the star rating block selected](./docs/star-rating-frontendberg.png)

![Screenshot the star rating block in the editor](./docs/star-rating-block-screenshot.png)

Notice the right sidebar and the different settings this block has:

![Screenshot of the star rating block settings in the editor sidebar](./docs/star-rating-block-settings.png)

## Open the demo app

Before anything else, please make sure the demo app loads on your device/emulator.

Notice that a "Star Rating" block is already available when you tap on the Inserter ( ⊕ ).

Try to insert this block into the document and notice its current limitation.

Open the [Rating Star block code](./extra-blocks/rating-star/index.js) and
familiarize yourself with the code.

### Step 1 - Load internal modules

👨‍💻 Refactor the `edit` and `save` functions into their own module `edit.js` and `save.js`.

‍Run `yarn lint` to make sure your new modules use the right syntax. Fix the reported errors if any.

### Step 2 - Replace the star emoji with an SVG icon

An SVG-based component (`StarIcon`) is available for you to use in the `rating-star/icon.js`.

👨‍💻 Import it in your `edit.js` module and try to replace the emojis with this icon component instead. 

Use it with the boolean `filled` property to display a 3 out of 5 stars rating.

> Tip: To lay all the stars horizontally you can wrap them all in a `View` component with the following styles:
> ```jsx
> <View style={ { flex: 1, flexDirection: 'row' } }>
> </View>
> ```

### Step 3 - Adjust the rating by tapping on a star

Now, let's make it listen for touch events and adjust the rating accordingly.

For this, we'll be using the [`TouchableWithoutFeedback`](https://facebook.github.io/react-native/docs/touchablewithoutfeedback)
component from `react-native`. Take a minute to have a look at its documentation.

We'll want to know which star was touched. An easy way to achieve this is to
wrap each star into its own `TouchableWithoutFeedback` component and handle the
press event with some information about which star was touched.

👨‍💻 In your `edit.js` module, create a separate component (call it `TouchableStar` for instance) to be reused in `edit()`.
Its implementation should look something like this:
```jsx
<TouchableWithoutFeedback onPress={ ... }>
    <View>
        <StarIcon .../>
    </View>
</TouchableWithoutFeedback>
```

👨‍💻 Replace `StarIcon` instances in `edit()` with your new component.

👨‍💻 Now update `edit()` to render 5 stars without repetition in your code.

You can use lodash [`range`](https://lodash.com/docs/4.17.15#range) or [`times`](https://lodash.com/docs/4.17.15#times) helpers for that.

👨‍💻 Make the current rating a variable (called `rating`).

Update its value in your code and see the amount of stars change automatically.
If it doesn't work, force a reload of the app by shaking your device.

👨‍💻 We need the `StarRating` component to refresh whenever the rating changes,
for this we'll use `useState` from the `@wordpress/element` package:
```js
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
```

> Note: This `useState` function is the same as the one from `react`, it's just abstracted into the `@wordpress/element`
> package.
> Take a moment to read the react documentation on [State Hooks](https://reactjs.org/docs/hooks-overview.html).


### Step 4 - Make it persistent

So far we've used a react state hook to handle state inside our component.
This is fine, however, the value you pick won't be persisted into the post/page.

To achieve this we'll need to rely on [Gutenberg's block API](https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/).
In that context, persisted state variables are called `attributes`. 

Gutenberg Blocks are [connected components](https://react-redux.js.org/introduction/quick-start)
in the sense that they are bound to a Redux store, and will "re-render" whenever one of its attribute is changed.

What you need to remember though is that the Gutenberg API automatically provides those `attributes` as props
of our `Edit` and `Save` component. It also provides some useful functions such as `setAttributes` that allows
you to update those same attributes.

Attributes have to be defined inside the block settings. Take a moment to look at the [web `StarRating` attributes](https://github.com/Automattic/jetpack/blob/master/extensions/blocks/rating-star/index.js#L42),,
we'll want to reuse some of those.

Using this API we can replace our use of hooks with attributes.

👨‍💻 Add a new `rating` attribute in the block settings.

👨‍💻 Update the `edit()` component to use it in place of the `useState` hook.

👨‍💻 Update the `save()` component to render the right rating.

Shake your device and select "Show html" to see the resulting template when you update the rating.

### Step 5 - Make the highest rating adjustable

👨‍💻 Add a new `maxRating` attribute to your block to handle the maximum number of stars to display.

👨‍💻 Update `edit()` and `save()` to take this attribute into account.

👨‍💻 Add a settings screen for this block to let users change the value of this attribute from the editor.

Have a look at the implementation of the [Spacer block](https://github.com/WordPress/gutenberg/blob/master/packages/block-library/src/spacer/edit.native.js#L59)
to see how to add a settings bottom sheet with a Slider component in it.


### Step 6 - Align options

The web version supports different options for horizontal alignment:

![Screenshot of the alignment options for the rating star block](./docs/star-rating-align.png)

👨‍💻 Add those options to align the stars left, center or right.

You can have a look at the [paragraph block](https://github.com/WordPress/gutenberg/blob/master/packages/block-library/src/paragraph/edit.native.js#L60)
implementation to see how it's done.

> Note: Just like with Paragraph, you will need to have an `align` attribute to persist this setting.

Make sure the this new attribute is persisted into the template when you switch to HTML mode.

### Step 7 (Optional) - Support half star ratings.

Start by supporting floats for `rating`.
The `filled` property of the `StarIcon` component also supports a number between 0 and 1.

👨‍💻 Use it to display half a star when the fractional part of the rating is over `0.5`.

Try it by editing the value of the `rating` from the HTML mode and switching back to Visual.

👨‍💻 Make it so that pressing the same star a second time shows a half star filled and updates the `rating` attribute by `-0.5`.

👨‍💻 Pressing the star a third time should toggle it back to the full star rating.

👨‍💻 Update `save()` to use ✨ (the Sparkles emoji) for the 0.5 star.

👨‍💻 Draw a box around the last pressed star, just like on the web.

Try using `useState` and `useEffect` to achieve this.

