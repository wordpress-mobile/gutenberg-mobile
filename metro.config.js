const path = require( 'path' );
const {
	applyConfigForLinkedDependencies,
} = require( '@carimus/metro-symlinked-deps' );

const additionalWatchFolders = [].map( ( dependency ) =>
	path.dirname( require.resolve( `${ dependency }/package.json` ) )
);

module.exports = applyConfigForLinkedDependencies(
	require( './gutenberg/packages/react-native-editor/metro.config.js' ),
	{
		projectRoot: path.resolve( __dirname ),
		blacklistDirectories: [ 'gutenberg/node_modules' ],
		additionalWatchFolders,
		resolveNodeModulesAtRoot: true,
	}
);
