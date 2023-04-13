#!/usr/bin/env node

const fs = require( 'fs' ),
	path = require( 'path' ),
	crypto = require( 'crypto' );

const indent = '    ';

/**
 * Encode a raw string into an Android-compatible value
 *
 * See: https://tekeye.uk/android/examples/android-string-resources-gotchas
 * @param {string} unsafeXMLValue input string to be escaped
 * @return {string} Escaped string to be copied into the XML <string></string> node
 */
function escapeResourceXML( unsafeXMLValue ) {
	// See: https://tekeye.uk/android/examples/android-string-resources-gotchas
	// Let's replace XML special characters  <, >, &, ", ', \, \t and \n
	// Note that this does not support android:textstyle attributes (<b></b>...)
	return unsafeXMLValue.replace( /(\r?\n|\r|\t|<|>|&|'|"|\\)/gm, function(
		character
	) {
		switch ( character ) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return "\\'";
			case '"':
				return '\\"';
			case '\r':
			case '\n':
			case '\r\n':
				return '\\n';
			case '\t':
				return '\\t';
			case '\\':
				return '\\\\';
		}
	} );
}

/**
 * Replacement for complying the TypographyDashes Android lint rule.
 * Reference: https://android.googlesource.com/platform/tools/base/+/master/lint/libs/lint-checks/src/main/java/com/android/tools/lint/checks/TypographyDetector.java#58
 *
 * @param {string} XMLValue input to apply replacement.
 * @return {string} valid string passing TypographyDashes Android lint rule.
 */
function replaceHyphenInNumberRanges( XMLValue ) {
	return XMLValue.replace( /(\d+\s*)(-)(\s*\d+)/gm, function(
		match,
		p1,
		p2,
		p3
	) {
		// Make sure that if there is no space before digit there isn't
		// one on the left either -- since we don't want to consider
		// "1 2 -3" as a range from 2 to 3
		const isNegativeNumber = p3[ 0 ] !== ' ' && p1[ p1.length - 1 ] === ' ';

		return [ p1, p3 ].join( isNegativeNumber ? p2 : '–' );
	} );
}

/**
 * Replacement for complying the TypographyEllipsis Android lint rule.
 * Reference: https://android.googlesource.com/platform/tools/base/+/master/lint/libs/lint-checks/src/main/java/com/android/tools/lint/checks/TypographyDetector.java#106
 *
 * @param {string} XMLValue input to apply replacements.
 * @return {string} valid string passing TypographyEllipsis Android lint rule.
 */
const THREE_DOTS_PATTERN = /(\.\.\.)/gm;
function replaceEllipsis( XMLValue ) {
	return XMLValue.replace( THREE_DOTS_PATTERN, '…' );
}

/**
 * Android specifics replacements.
 *
 * @param {string} XMLValue input to apply replacements.
 * @return {string} valid string passing Android lint rules.
 */
function androidReplacements( XMLValue ) {
	return [ replaceHyphenInNumberRanges, replaceEllipsis ].reduce(
		( value, replacement ) => replacement( value ),
		XMLValue
	);
}

/**
 * Generate a unique string identifier to use as the `name` property in our xml.
 * Try using the string first by stripping any non-alphanumeric characters and cropping it
 * Then try hashing the string and appending it to the the sanatized string
 * If none of the above makes a unique ref for our string throw an error
 *
 * @param {string} str raw string
 * @param {string} prefix Optional prefix to add to the name
 * @return {string} A unique name for this string
 */
const getUniqueName = ( function() {
	const names = {};
	const ANDROID_MAX_NAME_LENGTH = 100;
	const HASH_LENGTH = 8;
	return ( str, prefix = 'gutenberg_native_' ) => {
		const maxNameLength =
			ANDROID_MAX_NAME_LENGTH - prefix.length - HASH_LENGTH - 10; // leave some margin just in case
		let name = str
			.replace( /\W+/g, '_' )
			.toLocaleLowerCase()
			.substring( 0, maxNameLength );
		// trim underscores left and right
		name = name.replace( /^_+|_+$/g, '' );
		// if name exists, use name + hash of the full string
		if ( name in names ) {
			const strHashShort = crypto
				.createHash( 'sha1' )
				.update( str )
				.digest( 'hex' )
				.substring( 0, HASH_LENGTH );
			name = `${ name }_${ strHashShort }`;
		}
		// if name still exists
		if ( name in names ) {
			throw new Error(
				`Could not generate a unique name for string "${ str }"`
			);
		}
		names[ name ] = true;
		return `${ prefix }${ name }`;
	};
} )();

function strings2Android( strings ) {
	const androidResourcesMap = Object.values( strings ).reduce(
		( result, { string, stringPlural, comments } ) => {
			if ( ! string ) {
				return result;
			}
			const uniqueName = getUniqueName( string );
			const escapedValue = androidReplacements(
				escapeResourceXML( string )
			);
			const escapedValuePlural = androidReplacements(
				escapeResourceXML( stringPlural || '' )
			);
			const comment = comments || '';
			let localizedEntry = '';
			if ( comment ) {
				localizedEntry += `${ indent }<!-- ${ comment.replace(
					'--',
					'—'
				) } -->\n`;
			}
			if ( stringPlural ) {
				localizedEntry += `${ indent }<string-array name="${ uniqueName }" tools:ignore="UnusedResources">
${ indent }${ indent }<item>${ escapedValue }</item>
${ indent }${ indent }<item>${ escapedValuePlural }</item>
${ indent }</string-array>
`;
			} else {
				localizedEntry += `${ indent }<string name="${ uniqueName }" tools:ignore="UnusedResources">${ escapedValue }</string>\n`;
			}
			result[ uniqueName ] = localizedEntry;
			return result;
		},
		{}
	);
	// try to minimize changes in diffs by sorting strings
	const androidResourcesSortedList = Object.entries( androidResourcesMap )
		.sort( ( left, right ) => left[ 0 ].localeCompare( right[ 0 ] ) )
		.map( ( entry ) => entry[ 1 ] );
	return `<?xml version="1.0" encoding="utf-8"?>\n<resources xmlns:tools="http://schemas.android.com/tools">\n${ androidResourcesSortedList.join(
		''
	) }</resources>\n`;
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
	let onlyNativeStrings = flattenUsedStrings.filter( ( item ) => {
		const { platforms, string } = item;

		const isNative =
			! platforms.includes( 'web' ) && platforms.includes( 'android' );
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

	const xmlOutput = strings2Android( onlyNativeStrings );

	// Assure that the destination directory exists
	const destinationDir = path.dirname( destination );
	if ( ! fs.existsSync( destinationDir ) ) {
		fs.mkdirSync( destinationDir, { recursive: true } );
	}

	fs.writeFileSync( destination, xmlOutput );
}

module.exports = strings2Android;
