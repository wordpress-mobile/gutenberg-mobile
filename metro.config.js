const path = require( 'path' );
const blacklist = require( './node_modules/metro-config/src/defaults/blacklist' );

const gutenbergMetroConfigCopy = {
	...require( './gutenberg/packages/react-native-editor/metro.config.js' ),
};

gutenbergMetroConfigCopy.resolver.extraNodeModules = new Proxy(
	{},
	{
		get: ( target, name ) =>
			path.join( process.cwd(), `gutenberg/node_modules/${ name }` ),
	}
);

gutenbergMetroConfigCopy.resolver.blacklistRE = blacklist( [
	path.join( process.cwd(), 'jetpack/package.json' ),
] );

module.exports = gutenbergMetroConfigCopy;
