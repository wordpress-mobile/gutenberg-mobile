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
	],
	settings: {
		'import/resolver': {
			'node': {
				'moduleDirectory': ['node_modules', 'gutenberg/node_modules']
			}
		},
	},
	rules: {
		// do not throw an error if imported dependencies are 
		// declared in `package.json` or `gutenberg/package.json`
		"import/no-extraneous-dependencies": ["error", {"packageDir": ['.', './gutenberg/']}] 
	}
};
