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
	'./jetpack/node_modules/.pnpm/node_modules',
].map( ( dir ) => path.join( process.cwd(), dir ) );

const possibleModulePath = ( name ) =>
	nodeModulePaths.map( ( dir ) => path.join( dir, name ) );

gutenbergMetroConfigCopy.resolver.resolveRequest = (
	context,
	moduleName,
	platform
) => {
	if ( moduleName[ 0 ] !== '.' ) {
		const [ namespace, module = '' ] = moduleName.split( '/' );
		const name = path.join( namespace, module );

		if ( ! extraNodeModules[ name ] ) {
			const modulePath = possibleModulePath( name ).find( fs.existsSync );

			if ( modulePath ) {
				extraNodeModules[ name ] = fs.realpathSync( modulePath );
			}
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
