#!/usr/bin/env node

const gettextParser = require( 'gettext-parser' ),
	fs = require( 'fs' ),
	path = require( 'path' );

function po2Swift( strings ) {
	const swiftStringsMap = strings.reduce(
		( result, { string, comments } ) => {
			if ( ! string ) {
				return result;
			}
			const encodedValue = JSON.stringify( string );
			const encodedComment = JSON.stringify( comments || '' );
			result[
				string
			] = `_ = NSLocalizedString(${ encodedValue }, comment: ${ encodedComment })`;
			return result;
		},
		{}
	);
	const swiftStringsSortedList = Object.entries( swiftStringsMap )
		.sort( ( left, right ) => left[ 0 ].localeCompare( right[ 0 ] ) )
		.map( ( entry ) => entry[ 1 ] );
	return `import Foundation\n\nprivate func dummy() {\n    ${ swiftStringsSortedList.join(
		'\n    '
	) }\n`;
}

// Returns used strings of a specified domain
const getUsedStrings = ( usedStringsFile ) => {
	return require( path.resolve( usedStringsFile ) );
};

if ( require.main === module ) {
	const destination = process.argv[ 2 ];
	const usedStringsFile = process.argv[ 3 ];

	const usedStrings = getUsedStrings( usedStringsFile );
	const flattenUsedStrings = Object.entries( usedStrings ).reduce(
		( result, [ domain, strings ] ) => {
			return [ ...result, ...Object.values( strings ) ];
		},
		[]
	);
	let onlyNativeStrings = flattenUsedStrings.filter( ( { platforms } ) => {
		return ! platforms.includes( 'web' ) && platforms.includes( 'ios' );
	}, [] );
	onlyNativeStrings = [ ...new Set( onlyNativeStrings ) ];

	const swiftOutput = po2Swift( onlyNativeStrings );
	fs.writeFileSync( destination, swiftOutput );
}

module.exports = po2Swift;
