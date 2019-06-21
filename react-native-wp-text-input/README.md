
# react-native-wp-text-input

## Getting started

`$ npm install react-native-wp-text-input --save`

### Mostly automatic installation

`$ react-native link react-native-wp-text-input`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-wp-text-input` and add `WPTextInput.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libWPTextInput.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.WPTextInputPackage;` to the imports at the top of the file
  - Add `new WPTextInputPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-wp-text-input'
  	project(':react-native-wp-text-input').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-wp-text-input/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-wp-text-input')
  	```

## Usage
```javascript
import WPTextInput from 'react-native-wp-text-input';

// TODO: What to do with the module?
WPTextInput;
```
  