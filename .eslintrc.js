/**
 * External dependencies
 */
const { map } = require( 'lodash' );

module.exports = {
	parser: "babel-eslint",
	env: {
		browser: true,
		"jest/globals": true
	},
	globals: {
		__DEV__: true
	},
	plugins: [
		"react",
		"react-native",
		"jest",
	],
	extends: [
		"plugin:@wordpress/eslint-plugin/recommended",
	]
};
