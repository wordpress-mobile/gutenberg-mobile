# Mobile Gutenberg

This is the mobile version of [Gutenberg](https://github.com/WordPress/gutenberg), targeting Android and iOS. It's a React Native library bootstrapped by CRNA and now ejected.

## Getting Started

### Prerequisites

For a developer experience closer to the one the project maintainers currently have, make sure you have the following tools installed:

* git
* [nvm](https://github.com/creationix/nvm)
* Node.js and npm (use nvm to install them)
* [Android Studio](https://developer.android.com/studio/) to be able to compile the Android version of the app
* [Xcode](https://developer.apple.com/xcode/) to be able to compile the iOS app
* CocoaPods (`sudo gem install cocoapods`) needed to fetch React and third-party dependencies.
* [Carthage](https://github.com/Carthage/Carthage#installing-carthage) for Appium to be able run iOS UI tests

Depending on your setup, there may be a few configurations needed in Android Studio and Xcode. Please refer to [React Native's documentation](https://reactnative.dev/docs/environment-setup) for the latest requirements for each development environment.

Note that the OS platform used by the maintainers is macOS but the tools and setup should be usable in other platforms too.

### Clone the project

* Clone the project and submodules:
```
git clone --recurse-submodules https://github.com/wordpress-mobile/gutenberg-mobile.git
```

* Or if you already have the project cloned, initialize and update the submodules:
```
git submodule init
git submodule update
```

## Set up

Before running the demo app, you need to download and install the project dependencies. This is done via the following command:

```
nvm install
npm install
```

## Run

```
npm run start:reset
```

Runs the packager (Metro) in development mode. The packager stays running to serve the app bundle to the clients that request it.

With the packager running, open another terminal window and use the following command to compile and run the Android app:

```
npm run core android
```

The app should now open in a connected device or a running emulator and fetch the JavaScript code from the running packager.

To compile and run the iOS variant of the app using the _default_ simulator device, use:

```
npm run core ios
```

which will attempt to open your app in the iOS Simulator if you're on a Mac and have it installed.

### Running on Other iOS Device Simulators

To compile and run the app using a different device simulator, use:

```
npm run core ios --simulator="DEVICE_NAME"
```

For example, if you'd like to run in an iPhone Xs Max, try:

```
npm run core ios --simulator="iPhone Xs Max"
```

To see a list of all of your available iOS devices, use `xcrun simctl list devices`.

### Troubleshooting

If the Android emulator doesn't start correctly, or compiling fails with `Could not initialize class org.codehaus.groovy.runtime.InvokerHelper` or similar, it may help to double check the set up of your development environment against the latest requirements in [React Native's documentation](https://reactnative.dev/docs/environment-setup). With Android Studio, for example, you will need to configure the `ANDROID_HOME` environment variable and ensure that your version of JDK matches the latest requirements.

Some times, and especially when tweaking anything in the `package.json`, Babel configuration (`.babelrc`) or the Jest configuration (`jest.config.js`), your changes might seem to not take effect as expected. On those times, you might need to clean various caches before starting the packager. To do that, run the script: `npm run start:reset`. Other times, you might want to reinstall the NPM packages from scratch and the `npm run clean:install` script can be handy.

## Developing with Visual Studio Code

Although you're not required to use Visual Studio Code for developing gutenberg-mobile, it is the recommended IDE and we have some configuration for it.

When you first open the project in Visual Studio, you will be prompted to install some recommended extensions. This will help with some things like type checking and debugging.

![Prompt to install recommended extensions](https://github.com/WordPress/gutenberg/blob/7532a485b400f86638145b71f94f6f717e5add25/packages/react-native-editor/images/recommended-extensions.png)

One of the extensions we are using is the [React Native Tools](https://marketplace.visualstudio.com/items?itemName=vsmobile.vscode-react-native). This allows you to run the packager from VSCode or launch the application on iOS or Android. It also adds some debug configurations so you can set breakpoints and debug the application directly from VSCode. Take a look at the [extension documentation](https://marketplace.visualstudio.com/items?itemName=vsmobile.vscode-react-native) for more details.

## Unit Tests

Use the following command to run the test suite:

```
npm run test
```

It will run the [jest](https://github.com/facebook/jest) test runner on your tests. The tests are running on the desktop against Node.js.

To run the tests with debugger support, start it with the following CLI command:

```
npm run test:debug
```

Then, open `chrome://inspect` in Chrome to attach the debugger (look into the "Remote Target" section). While testing/developing, feel free to sprinkle `debugger` statements anywhere in the code that you'd like the debugger to break.

## Writing and Running Unit Tests

This project is set up to use [jest](https://facebook.github.io/jest/) for tests. You can configure whatever testing strategy you like, but jest works out of the box. Create test files in directories called `__tests__` or with the `.test.js` extension to have the files loaded by jest. See an example test [here](https://github.com/WordPress/gutenberg/blob/HEAD/packages/react-native-editor/src/test/api-fetch-setup.test.js). The [jest documentation](https://facebook.github.io/jest/docs/en/getting-started.html) is also a wonderful resource, as is the [React Native testing tutorial](https://facebook.github.io/jest/docs/en/tutorial-react-native.html).

## UI Tests

This repository uses Appium to run UI tests. The tests live in `__device-tests__` and are written using Appium to run tests against simulators and real devices. To run these you'll need to check off a few things:

### Set up

* When running the tests, you'll need to ensure the Metro bundler (`npm run start`) is not running.
* [Appium CLI](https://appium.io/docs/en/about-appium/getting-started/) installed and available globally. We also recommend using [appium-doctor](https://github.com/appium/appium-doctor) to ensure all of Appium's dependencies are good to go. You don't have to worry about starting the server yourself, the tests handle starting the server on port 4723, just be sure that the port is free or feel free to change the port number in the test file.
* For iOS a simulator should automatically launch but for Android you'll need to have an emulator fired up and running. The emulators must match the devices in Gutenberg's [caps.js](https://github.com/WordPress/gutenberg/blob/trunk/packages/react-native-editor/__device-tests__/helpers/caps.js) file.
  * iOS: __iPhone 13, iOS 15.4__
  * Android: __Google Pixel 3 XL GoogleAPI Emulator, Android 11__ _(Note: when creating the Pixel 3 XL emulator, ensure that "Enable Device Frame" is unchecked on the Verify Configuration screen.)_
    

  <img width="512" alt="Device Tests" src="https://github.com/wordpress-mobile/gutenberg-mobile/assets/643285/19c223cc-96d6-4c5a-98f1-a463bb98e927">

  

### Running the tests

Then, to run the UI tests on iOS:

`npm run test:e2e:ios:local`

and for Android:

`npm run test:e2e:android:local`

**Note:** Make sure you've run the above commands at least once, so the demo app binaries are built before running individual tests below.

To run a single test instead of the entire suite, use `npm run device-tests:local`. Here's an example that runs only `gutenberg-editor-paragraph.test`:

`TEST_RN_PLATFORM=ios npm run device-tests:local gutenberg-editor-paragraph.test`

Note: You might experience problems that seem to be related to the tests starting the Appium server, e.g. errors that say `Connection Refused`, `Connection Reset` or `The requested environment is not available`. For now, you can manually start the Appium server via [Appium Inspector](https://github.com/appium/appium-inspector/) or the CLI, then change the port number in the tests while (optionally) commenting out related code in the `beforeAll` and `afterAll` block.

For a more detailed outline of the UI tests and how to get started writing one, please visit the [UI Test documentation](https://github.com/WordPress/gutenberg/blob/HEAD/packages/react-native-editor/__device-tests__/README.md) and our [contributing guide](https://github.com/WordPress/gutenberg/blob/HEAD/packages/react-native-editor/__device-tests__/CONTRIBUTING.md).

## Static analysis and code style

The project includes a linter (`eslint`) to perform codestyle and static analysis of the code. The configuration used is the same as [the one in the Gutenberg project](https://github.com/WordPress/gutenberg/blob/HEAD/packages/eslint-plugin/README.md). To perform the check, run:

```
npm run lint
```

To have the linter also _fix_ the violations run: `npm run lint:fix`.

You might want to use Visual Studio Code as an editor. The project includes the configuration needed to use the above codestyle and linting tools automatically.

## Internationalization (i18n)

The support for i18n in the project is provided by three main areas for the different plugins included in Gutenberg Mobile:
1. Translations files download
2. Locale setup
3. Localization strings file generation

### Main areas

#### Translation files download
A translation file is basically a JSON object that contains key-value items with the translation for each individual string. This content is fetched from [translate.wordpress.org](https://translate.wordpress.org/) that holds translations for WordPress and a list of different plugins like Gutenberg.

These files are cached under the folder located at `src/i18n-cache/<PLUGIN_NAME>`, and can be optimized depending on the command used for fetching them. Additionally, an index file (`index.js`) is generated that acts as the entry point to import and get translations for each plugin.

Fetched translations contain all the strings of the plugin, including strings that are not used in the native version of the editor, however, and in order to reduce their file size, they can be optimized by filtering out the unused strings.

By default, when installing dependencies, un-optimized translations will be downloaded for the plugins specified in the `i18n:check-cache` NPM command within the `package.json` file. The reason for getting the un-optimized version is purely for speed reasons, as the optimization process takes up several minutes.

For the optimized versions, similarly, we have the `i18n:update` NPM command that can be used for this purpose. This command is also automatically run when generating the bundle via `npm run bundle`, this way we guarantee that a new version of the bundle contains up-to-date translations. On the other hand, it's important to mention that this command also generates the localization strings files described in a later section.

#### Locale setup
This is done upon the [editor initialization](https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/src/index.js), an array containing the following items related to each plugin is passed:
```
[
  {
    domain: <DOMAIN / PLUGIN NAME>, (i.e. `jetpack`)
    getTranslation: <CALLBACK_FOR_GETTING_TRANSLATION> (i.e. `getTranslation` function imported from `src/i18n-cache/jetpack/index.js`)
  },
  ...
]
```

#### Localization strings file generation
Some of the strings referenced in the editor are only used in the native version, these strings are not included in the translations fetched from [translate.wordpress.org](https://translate.wordpress.org/), however, they are part of the WordPress app translations. For this reason, we generate the following localization strings files, which contain these types of string, for each platform, and that are bundled and incorporated in the translation pipeline of the app.
- [`bundle/android/strings.xml`](https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/bundle/android/strings.xml)
- [`bundle/ios/GutenbergNativeTranslations.swift`](https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/bundle/ios/GutenbergNativeTranslations.swift)

These files are generated via the `i18n:update` NPM command, and like translations, they are also produced when generating the bundle.

### NPM commands
- `npm run i18n:update`: Downloads optimized translations and generate localization strings files for all plugins. **NOTE:** This command is attached to `bundle` NPM command via `prebundle:js`, so it will be automatically executed when generating a bundle.
- `npm run i18n:check-cache`: Downloads un-optimized translations for plugins that don't have a cache folder. **NOTE:** This command is attached to dependency installation via `postinstall`, so it will be automatically executed when installing dependencies.

### How to add a new plugin
1. Identify the i18n domain, which usually matches the plugin's name (i.e. `jetpack`).
2. Identify the GlotPress project slug (i.e. `wp-plugins/jetpack` for URL `https://translate.wordpress.org/projects/wp-plugins/jetpack/`)
3. Identify the path to the plugin's source code (i.e. `./jetpack/projects/plugins/jetpack/extensions`).
4. Append the plugin's name, GlotPress project slug, and plugin's source code to the arguments of `i18n:update` and `i18n:update:test` NPM commands.
5. Append the plugin's name and GlotPress project slug to the arguments of `i18n:check-cache` NPM command.

*Example:*
```
"scripts": {
  ...
  "i18n:check-cache": "... jetpack wp-plugins/jetpack",
  "i18n:update": "... jetpack wp-plugins/jetpack ./jetpack/projects/plugins/jetpack/extensions",
  "i18n:update:test": "... jetpack wp-plugins/jetpack ./jetpack/projects/plugins/jetpack/extensions",
  ...
}
```

6. Add the i18n domain of the plugin and the callback for getting translation to the [editor initialization](https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/src/index.js).
*Example:*
```
import { getTranslation as getJetpackTranslation } from './i18n-translations/jetpack';
...

const pluginTranslations = [
	{
		domain: 'jetpack',
		getTranslation: getJetpackTranslation,
	},
	...
];
```

7. (Optional) In some cases, it's needed to build the source code in order to extract the used strings. Consider adding a command in [`bin/i18n-update.sh`](https://github.com/wordpress-mobile/gutenberg-mobile/blob/develop/bin/i18n-update.sh) file for this purpose (e.g. `./bin/run-jetpack-command.sh "-C projects/packages/videopress build"` to build VideoPress package)

### Caveats
- Strings that are only used in the native version, and reference a [context](https://developer.wordpress.org/plugins/internationalization/how-to-internationalize-your-plugin/#disambiguation-by-context), won't be included in the localization strings files hence, they won't be translated. This is a limitation in the format of the localization strings files.
- Localization strings files don’t support domains, so the strings extracted from plugins that are only used in the native version, will be unified in the same file, which might involve string conflicts.

### Troubleshooting

#### A string is missing the translation
This can be produced by several causes, check the following steps in order to identify the source:
- Verify that the string uses the `__` i18n function or similar ([reference](https://github.com/WordPress/gutenberg/blob/trunk/packages/i18n/README.md)).
- Check for warnings in the output when running `i18n:update` NPM command, especially the following ones:
  - Parsing files issues (i.e. `Debug (make-pot): Could not parse file <FILE>`)
  - Missing strings in translation files (i.e. `WARNING: The following strings are missing from translations:`)
- If the string is only used in the native version, the translation won't be available until the a new version of the app is cut and its translations are requested. Check if the string is included in the localization strings files, if not, verify the output of `i18n:update` NPM command and look for warnings that reference the string.

## License

Gutenberg Mobile is an Open Source project covered by the [GNU General Public License version 2](LICENSE).

