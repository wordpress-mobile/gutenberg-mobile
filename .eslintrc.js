module.exports = {
	parser: 'babel-eslint',
	env: {
		browser: true,
		'jest/globals': true,
	},
	globals: {
		__DEV__: true,
	},
	plugins: [ 'react', 'react-native', 'jest' ],
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	settings: {
		'import/resolver': {
			node: {
				moduleDirectory: [ 'node_modules', 'gutenberg/node_modules' ],
			},
		},
	},
	rules: {
		// do not throw an error if imported dependencies are
		// declared in `package.json` or `gutenberg/package.json`
		'import/no-extraneous-dependencies': [
			'error',
			{ packageDir: [ '.', './gutenberg/' ] },
		],
	},
	overrides: [
		{
			// Disable rules for tests as we do in Gutenberg.
			// Reference: https://git.io/JSMAQ
			files: [ 'src/**/test/**/*.js' ],
			rules: {
				'import/default': 'off',
				'import/no-extraneous-dependencies': 'off',
				'import/no-unresolved': 'off',
				'import/named': 'off',
				'@wordpress/data-no-store-string-literals': 'off',
			},
		},
		{
			// Workaround for addressing errors when importing react-native components.
			// Related issue: https://git.io/JSKeJ
			files: [ 'src/**/*.js' ],
			settings: {
				'import/ignore': [ 'react-native' ],
			},
		},
	],
};
