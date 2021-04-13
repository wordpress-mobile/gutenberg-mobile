const path = require( 'path' );

const gutenbergMetroConfigCopy = {
	...require( './gutenberg/packages/react-native-editor/metro.config.js' ),
};

if ( process.env.LOCAL_REPO ) {
	gutenbergMetroConfigCopy.watchFolders.push( path.resolve( __dirname, process.env.LOCAL_REPO ) );
}

gutenbergMetroConfigCopy.resolver.extraNodeModules = new Proxy(
	{},
	{
		get: ( target, name ) =>
			path.join( process.cwd(), `gutenberg/node_modules/${ name }` ),
	}
);

module.exports = gutenbergMetroConfigCopy;
