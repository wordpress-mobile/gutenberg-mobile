const path = require( 'path' );
const {
	getDefaultConfig,
	mergeConfig,
} = require( '@react-native/metro-config' );
const gutenbergConfig = require( './gutenberg/packages/react-native-editor/metro.config.js' );

const defaultConfig = getDefaultConfig( __dirname );

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
	projectRoot: path.resolve( __dirname ),
	resolver: {
		// Exclude `ios-xcframework` folder to avoid conflicts with packages contained in Pods.
		blocklist: [ /ios-xcframework\/.*/ ],
		nodeModulesPaths: [
			path.resolve( __dirname, 'gutenberg/node_modules' ),
			path.resolve(
				__dirname,
				'jetpack/projects/plugins/jetpack/node_modules'
			),
		],
		sourceExts: [
			...defaultConfig.resolver.sourceExts,
			'cjs',
			'scss',
			'sass',
		],
		resolveRequest,
	},
};

function resolveRequest( context, moduleName, platform ) {
	// We do not install `block-experiments` dependencies, so we must resolve them
	// manually to the `gutenberg` node_modules folder.
	if (
		context.originModulePath.includes( 'block-experiments' ) &&
		! moduleName.startsWith( '.' ) &&
		! moduleName.startsWith( '/' )
	) {
		return {
			filePath: `gutenberg/node_modules/${ moduleName }`,
			type: 'sourceFile',
		};
	}

	// Fallback to the standard Metro resolver
	return context.resolveRequest( context, moduleName, platform );
}

module.exports = mergeConfig( gutenbergConfig, config );
