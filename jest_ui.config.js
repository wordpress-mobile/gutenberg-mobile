const gutenbergJestUIConfig = require( './gutenberg/packages/react-native-editor/jest_ui.config.js' );

module.exports = {
	...gutenbergJestUIConfig,
	setupFilesAfterEnv: [
		'./jest_ui_setup_after_env.js',
		'./gutenberg/packages/react-native-editor/jest_ui_setup_after_env.js',
	],
	testEnvironment:
		'./gutenberg/packages/react-native-editor/jest_ui_test_environment.js',
};
