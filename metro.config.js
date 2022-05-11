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
		extraNodeModules,
	},
};

const nodeModulePaths = [
	'gutenberg/node_modules',
	'jetpack/projects/plugins/jetpack/node_modules',
];

const possibleModulePath = ( name ) =>
	nodeModulePaths.map( ( dir ) => path.join( process.cwd(), dir, name ) );

const packagedByPnpm = ( dir ) => dir && dir.includes( '.pnpm' );

gutenbergMetroConfigCopy.resolver.resolveRequest = (
	context,
	moduleName,
	platform
) => {
	if ( ! ( moduleName.startsWith( '.' ) || moduleName.startsWith( '/' ) ) ) {
		const [ namespace, module = '' ] = moduleName.split( '/' );
		const name = path.join( namespace, module );

		if ( ! extraNodeModules[ name ] ) {
			let extraNodeModulePath;

			const modulePath = possibleModulePath( name ).find( fs.existsSync );
			if ( modulePath ) {
				extraNodeModulePath = fs.realpathSync( modulePath );
			}

			if ( ! extraNodeModulePath ) {
				// Check if package is managed by pnpm
				const filePath = require.resolve( name, {
					paths: [ path.dirname( context.originModulePath ) ],
				} );

				const innerNodeModules = filePath.match(
					/.*node_modules/
				)?.[ 0 ];

				if ( packagedByPnpm( innerNodeModules ) ) {
					extraNodeModulePath = path.join( innerNodeModules, name );
				}
			}

			extraNodeModules[ name ] = extraNodeModulePath;
		}
	}

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
