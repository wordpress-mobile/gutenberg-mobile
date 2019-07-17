const path = require( 'path' );

const projectRoot = path.resolve( __dirname, '..' );
const haulCli = path.resolve( projectRoot, 'node_modules/.bin/haul' );
const metroCli = path.resolve( projectRoot, 'node_modules/.bin/react-native' );

if ( process.env.PACKAGER === 'haul' ) {
	require( haulCli );
} else {
	require( metroCli );
}
