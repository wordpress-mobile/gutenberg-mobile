
# react-native-plain-text

## Getting started

`$ npm install react-native-plain-text --save`

### Mostly automatic installation

`$ react-native link react-native-plain-text`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-plain-text` and add `RNPlainText.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNPlainText.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.RNPlainTextPackage;` to the imports at the top of the file
  - Add `new RNPlainTextPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-plain-text'
  	project(':react-native-plain-text').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-plain-text/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-plain-text')
  	```

#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the `RNPlainText.sln` in `node_modules/react-native-plain-text/windows/RNPlainText.sln` folder to their solution, reference from their app.
2. Open up your `MainPage.cs` app
  - Add `using Plain.Text.RNPlainText;` to the usings at the top of the file
  - Add `new RNPlainTextPackage()` to the `List<IReactPackage>` returned by the `Packages` method


## Usage
```javascript
import RNPlainText from 'react-native-plain-text';

// TODO: What to do with the module?
RNPlainText;
```
  