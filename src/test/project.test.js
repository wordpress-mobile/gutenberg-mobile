/** @format */

/**
 * External dependencies
 */
import fs from 'fs';
import _ from 'lodash';

describe( 'RN version from root is same in', () => {
	const rootRNVersion = parseRNVersionFromPackageJson( '.', 'dependencies' );
	expect( rootRNVersion ).toBeDefined();

	[ 'react-native-aztec', 'react-native-gutenberg-bridge' ].forEach( ( path ) => {
		it( path, () => {
			const otherRNVersion = parseRNVersionFromPackageJson( path, 'peerDependencies' );
			expect( otherRNVersion ).toEqual( rootRNVersion );
		} );
	} );
} );

function parseRNVersionFromPackageJson( packageJsonPath, section ) {
	const packageJson = JSON.parse( fs.readFileSync( `${ packageJsonPath }/package.json` ) );
	return _.get( packageJson, [ section, 'react-native' ] );
}
