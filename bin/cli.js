const path = require( 'path' );

const projectRoot = path.resolve( __dirname, '..' );

if ( process.env.PACKAGER === 'haul' ) {
	const haulCli = path.resolve( projectRoot, 'node_modules/.bin/haul' );
	require( haulCli );
} else {
	const cli = require( '@react-native-community/cli' );
	cli.run();
}
