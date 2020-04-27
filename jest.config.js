/**
 * External dependencies
 */
const glob = require( 'glob' ).sync;
const uniq = require( 'lodash/uniq' );

const defaultPlatform = 'android';
const rnPlatform = process.env.TEST_RN_PLATFORM || defaultPlatform;
if ( process.env.TEST_RN_PLATFORM ) {
	// eslint-disable-next-line no-console
	console.log( 'Setting RN platform to: ' + process.env.TEST_RN_PLATFORM );
} else {
	// eslint-disable-next-line no-console
	console.log( 'Setting RN platform to: default (' + defaultPlatform + ')' );
}

const configPath = 'gutenberg/test/native';

const transpiledPackages = glob( 'gutenberg/packages/*{/src,}/index.js' ).reduce( ( mapper, modulePath ) => {
		const moduleName = modulePath.split( '/' )[ 2 ];
		if ( ! mapper[ `@wordpress/${ moduleName }` ] ) {
			mapper[ `@wordpress/${ moduleName }` ] = '<rootDir>/' + modulePath.replace( /\/index\.js$/, '' );
		}
		return mapper;
	}, {} );

module.exports = {
	verbose: true,
	rootDir: '.',
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	preset: 'react-native',
	setupFiles: [
		'<rootDir>/' + configPath + '/setup.js',
		'<rootDir>/' + configPath + '/enzyme.config.js',
	],
	testEnvironment: 'jsdom',
	testMatch: [
		'<rootDir>/src/**/test/*.[jt]s?(x)',
	],
	testPathIgnorePatterns: [
		'/node_modules/',
		'<rootDir>/gutenberg/',
		'<rootDir>/jetpack/',
		'/__device-tests__/',
	],
	testURL: 'http://localhost/',
	// Add the `Libraries/Utilities` subfolder to the module directories, otherwise haste/jest doesn't find Platform.js on Travis,
	// and add it first so https://github.com/facebook/react-native/blob/v0.60.0/Libraries/react-native/react-native-implementation.js#L324-L326 doesn't pick up the Platform npm module.
	moduleDirectories: [
		'<rootDir>/node_modules/react-native/Libraries/Utilities',
		'<rootDir>/node_modules',
	],
	moduleNameMapper: {
		// Mock the CSS modules. See https://facebook.github.io/jest/docs/en/webpack.html#handling-static-assets
		'\\.(scss)$': '<rootDir>/' + configPath + '/__mocks__/styleMock.js',
		...transpiledPackages,
	},
	modulePathIgnorePatterns: [
		'<rootDir>/gutenberg/node_modules',
	],
	haste: {
		defaultPlatform: rnPlatform,
		platforms: [ 'android', 'ios', 'native' ],
		providesModuleNodeModules: [ 'react-native', 'react-native-svg' ],
	},
	transformIgnorePatterns: [
		// This is required for now to have jest transform some of our modules
		// See: https://github.com/wordpress-mobile/gutenberg-mobile/pull/257#discussion_r234978268
		// There is no overloading in jest so we need to rewrite the config from react-native-jest-preset:
		// https://github.com/facebook/react-native/blob/master/jest-preset.json#L20
		'node_modules/(?!(simple-html-tokenizer|@react-native-community|(jest-)?react-native|react-clone-referenced-element))',
	],
	snapshotSerializers: [ 'enzyme-to-json/serializer', 'jest-emotion' ],
	reporters: [ 'default', 'jest-junit' ],
};
