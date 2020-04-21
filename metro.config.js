/** @format */
const path = require( 'path' );
const enm = require( './gutenberg/packages/react-native-editor/extra-node-modules.config.js' );


module.exports = {
	projectRoot: path.resolve( __dirname, 'gutenberg/packages/react-native-editor' ),
	watchFolders: [
		path.resolve( __dirname ),
	],
	resolver: {
		sourceExts: [ 'js', 'json', 'scss', 'sass', 'ts', 'tsx' ],
		extraNodeModules: enm,
	},
	transformer: {
		babelTransformerPath: require.resolve( './gutenberg/packages/react-native-editor/sass-transformer.js' ),
		getTransformOptions: async () => ( {
			transform: {
				experimentalImportSupport: false,
				inlineRequires: false,
			},
		} ),
	},
};
