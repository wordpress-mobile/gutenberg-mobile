const path = require( 'path' );
const fs = require( 'fs' );
const metroResolver = require( 'metro-resolver' );

const gutenbergMetroConfig = require( './gutenberg/packages/react-native-editor/metro.config.js' );
const extraNodeModules = {};
const gutenbergMetroConfigCopy = {
	...gutenbergMetroConfig,
	resolver: {
		...gutenbergMetroConfig.resolver,
		sourceExts: [ 'js', 'jsx', 'json', 'scss', 'sass', 'ts', 'tsx' ],
		extraNodeModules
	},
};

const nodeModulePaths = [
	'gutenberg/node_modules',
	'jetpack/projects/plugins/jetpack/node_modules',
];

const possibleModulePaths = ( name ) =>
	nodeModulePaths.map( ( dir ) => path.join( process.cwd(), dir, name ) );

gutenbergMetroConfigCopy.resolver.resolveRequest = (
	context,
	moduleName,
	platform
) => {
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

				const innerNodeModules = filePath.match(
					/.*node_modules/
				)?.[ 0 ];

				extraNodeModulePath =
					innerNodeModules && path.join( innerNodeModules, name );
			}

			if ( extraNodeModulePath ) {
				extraNodeModules[ name ] = extraNodeModulePath;
			}
		}
	}

	if ( moduleName.startsWith( '@automattic/jetpack-config' ) ) {
		return {
			filePath: path.resolve(
				__dirname,
				'jetpack/projects/js-packages/config/src/index.js'
			),
			type: 'sourceFile',
		};
	}

	if ( moduleName.startsWith( '@automattic/jetpack-connection' ) ) {
		return {
			filePath: path.resolve(
				__dirname,
				'src/jetpack-connection.js'
			),
			type: 'sourceFile',
		};
	}

	// Restore the original resolver
	return metroResolver.resolve(
		{
			...context,
			resolveRequest: null,
		},
		moduleName,
		platform
	);
};

module.exports = gutenbergMetroConfigCopy;
