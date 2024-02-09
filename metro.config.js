const path = require( 'path' );
const fs = require( 'fs' );
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
		sourceExts: [
			...defaultConfig.resolver.sourceExts,
			'cjs',
			'scss',
			'sass',
		],
		unstable_enableSymlinks: false,
		resolveRequest,
	},
};

function resolveRequest( context, moduleName, platform ) {
	const { extraNodeModules } = context;

	// Manage Jetpack Config setup typically handled by Webpack's externals.
	if ( moduleName.startsWith( '@automattic/jetpack-config' ) ) {
		return {
			filePath: path.resolve( __dirname + '/src/jetpack-config.js' ),
			type: 'sourceFile',
		};
	}

	if ( /^@wordpress\/[\w\d-]+/.test( moduleName ) ) {
		const [ namespace, module = '' ] = moduleName.split( '/' );
		const packageName = path.join( namespace, module );
		extraNodeModules[ packageName ] = path.resolve(
			__dirname,
			`./gutenberg/packages/${ module }`
		);
	}

	// Add the module to the extra node modules object if the module is not on a local path.
	if ( ! ( moduleName.startsWith( '.' ) || moduleName.startsWith( '/' ) ) ) {
		const [ namespace, module = '' ] = moduleName.split( '/' );
		const name = path.join( namespace, module );

		if ( ! extraNodeModules[ name ] ) {
			let extraNodeModulePath;
			const modulePath = possibleModulePaths( name ).find(
				fs.existsSync
			);
			extraNodeModulePath = modulePath && fs.realpathSync( modulePath );
			// If we haven't resolved the module yet, check if the module is managed by pnpm.
			if (
				! extraNodeModulePath &&
				context.originModulePath.includes( '.pnpm' )
			) {
				const filePath = require.resolve( name, {
					paths: [ path.dirname( context.originModulePath ) ],
				} );
				const innerNodeModules =
					filePath.match( /.*node_modules/ )?.[ 0 ];
				extraNodeModulePath =
					innerNodeModules && path.join( innerNodeModules, name );
			}

			if ( extraNodeModulePath ) {
				extraNodeModules[ name ] = extraNodeModulePath;
			}
		}
	}

	// Fallback to the standard Metro resolver
	return context.resolveRequest( context, moduleName, platform );
}

const possibleModulePaths = ( name ) =>
	nodeModulePaths.map( ( dir ) => path.join( process.cwd(), dir, name ) );

const nodeModulePaths = [
	'../../node_modules', // Gutenberg core
	'../../../jetpack/projects/plugins/jetpack/node_modules', // Jetpack plugin
];

module.exports = mergeConfig( gutenbergConfig, config );
