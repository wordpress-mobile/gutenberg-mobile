/* eslint-disable no-console */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const fetch = require( 'node-fetch' );

const supportedLocales = [
	'ar', // Arabic
	'bg', // Bulgarian
	'bo', // Tibetan
	'ca', // Catalan
	'cs', // Czech
	'cy', // Welsh
	'da', // Danish
	'de', // German
	'en-au', // English (Australia)
	'en-ca', // English (Canada)
	'en-gb', // English (UK)
	'en-nz', // English (New Zealand)
	'en-za', // English (South Africa)
	'el', // Greek
	'es', // Spanish
	'es-ar', // Spanish (Argentina)
	'es-cl', // Spanish (Chile)
	'es-cr', // Spanish (Costa Rica)
	'fa', // Persian
	'fr', // French
	'gl', // Galician
	'he', // Hebrew
	'hr', // Croatian
	'hu', // Hungarian
	'id', // Indonesian
	'is', // Icelandic
	'it', // Italian
	'ja', // Japanese
	'ka', // Georgian
	'ko', // Korean
	'nb', // Norwegian (Bokmål)
	'nl', // Dutch
	'nl-be', // Dutch (Belgium)
	'pl', // Polish
	'pt', // Portuguese
	'pt-br', // Portuguese (Brazil)
	'ro', // Romainian
	'ru', // Russian
	'sk', // Slovak
	'sq', // Albanian
	'sr', // Serbian
	'sv', // Swedish
	'th', // Thai
	'tr', // Turkish
	'uk', // Ukrainian
	'ur', // Urdu
	'vi', // Vietnamese
	'zh-cn', // Chinese (China)
	'zh-tw', // Chinese (Taiwan)
];

const getLanguageUrl = ( locale, plugin ) =>
	`https://translate.wordpress.org/projects/wp-plugins/${ plugin }/dev/${ locale }/default/export-translations\?format\=json`;

const getTranslationFilePath = ( locale ) => `./data/${ locale }.json`;

const fetchTranslation = ( locale, plugin ) => {
	console.log( 'fetching', getLanguageUrl( locale, plugin ) );
	const localeUrl = getLanguageUrl( locale, plugin );
	return fetch( localeUrl )
		.then( ( response ) => response.json() )
		.then( ( body ) => {
			return { response: body, locale };
		} )
		.catch( () => {
			console.error( `Could not find translation file ${ localeUrl }` );
		} );
};

const fetchTranslations = ( plugin ) => {
	const fetchPromises = supportedLocales.map( ( locale ) =>
		fetchTranslation( locale, plugin )
	);

	// Create data folder if it doesn't exist
	const dataDir = path.join( __dirname, `${ plugin }/data` );
	if ( ! fs.existsSync( dataDir ) ) {
		fs.mkdirSync( dataDir );
	}

	return Promise.all( fetchPromises ).then( ( results ) => {
		const fetchedTranslations = results.filter( Boolean );
		const translationFilePromises = fetchedTranslations.map(
			( languageResult ) => {
				return new Promise( ( resolve, reject ) => {
					const translationRelativePath = getTranslationFilePath(
						languageResult.locale,
						plugin
					);

					const translationAbsolutePath = path.resolve(
						__dirname,
						`${ plugin }/${ translationRelativePath }`
					);

					fs.writeFile(
						translationAbsolutePath,
						JSON.stringify( languageResult.response ),
						'utf8',
						( err ) => {
							if ( err ) {
								reject( err );
							} else {
								languageResult.path = translationRelativePath;
								resolve( translationRelativePath );
							}
						}
					);
				} );
			}
		);
		return Promise.all( translationFilePromises ).then(
			() => fetchedTranslations
		);
	} );
};

// if run as a script
if ( require.main === module ) {
	const args = process.argv.slice( 2 );
	const plugin = args[ 0 ] || 'gutenberg';
	const pluginDir = path.join( __dirname, plugin );

	if ( ! fs.existsSync( pluginDir ) ) {
		fs.mkdirSync( pluginDir );
	}

	fetchTranslations( plugin ).then( ( translations ) => {
		const indexNative = `/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. */
/* eslint-disable prettier/prettier */

const translations = {
${ translations
	.filter( Boolean )
	.map(
		( translation ) =>
			`\t"${ translation.locale }": require( "${ translation.path }" ),`
	)
	.join( '\n' ) }
};

export const getTranslation = ( locale ) => translations[ locale ];

/* eslint-enable prettier/prettier */
`;

		fs.writeFile(
			path.join( pluginDir, 'index.native.js' ),
			indexNative,
			'utf8',
			( error ) => {
				if ( error ) {
					console.error( error );
					return;
				}
				console.log( 'Done.' );
			}
		);
	} );
}

/* eslint-enable no-console */
