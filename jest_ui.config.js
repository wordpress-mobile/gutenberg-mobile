const main = require( './jest.config.js' );

module.exports = {
	...main,
	timers: 'real',
	setupFiles: [],
	testMatch: [
		'<rootDir>/__device-tests__/**/*.test.[jt]s?(x)',
		'<rootDir>/gutenberg/packages/react-native-editor/__device-tests__/**/*.test.[jt]s?(x)',
	],
	testPathIgnorePatterns: [ '/node_modules/', '<rootDir>/jetpack/' ],
};
