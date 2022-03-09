#!/usr/bin/env node

const fs = require( 'fs' ),
	path = require( 'path' );

function strings2Swift( strings ) {
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
	let flattenUsedStrings = Object.entries( usedStrings ).reduce(
		( result, [ domain, strings ] ) => {
			return [ ...result, ...Object.values( strings ) ];
		},
		[]
	);
	flattenUsedStrings = [ ...new Set( flattenUsedStrings ) ];

	const nativeStringsWithContext = [];
	const onlyNativeStrings = flattenUsedStrings.filter( ( item ) => {
		const { platforms, string } = item;

		const isNative =
			! platforms.includes( 'web' ) && platforms.includes( 'ios' );
		const hasContext = !! item.context;
		if ( isNative && hasContext ) {
			nativeStringsWithContext.push( string );
		}

		return isNative && ! hasContext;
	}, [] );

	// Notify about potential strings that won't be included due to having context
	if ( nativeStringsWithContext.length > 0 ) {
		console.log(
			"WARNING: The following strings won't be included as context is not supported:"
		);
		console.log( nativeStringsWithContext );
	}

	const swiftOutput = strings2Swift( onlyNativeStrings );

	// Assure that the destination directory exists
	const destinationDir = path.dirname( destination );
	if ( ! fs.existsSync( destinationDir ) ) {
		fs.mkdirSync( destinationDir, { recursive: true } );
	}

	fs.writeFileSync( destination, swiftOutput );
}

module.exports = strings2Swift;
