/**
 * WordPress dependencies
 */
import { setLocaleData } from '@wordpress/i18n';

export default ( { domain, locale, extraTranslations, getTranslation } ) => {
	let translations = getTranslation( locale );
	if ( locale && ! translations ) {
		// Try stripping out the regional
		locale = locale.replace( /[-_][A-Za-z]+$/, '' );
		translations = getTranslation( locale );
	}
	const allTranslations = Object.assign(
		{},
		translations,
		extraTranslations
	);
	// eslint-disable-next-line no-console
	console.log(
		domain ? `${ domain } - locale` : 'locale',
		locale,
		allTranslations
	);
	// Only change the locale if it's supported by gutenberg
	if ( translations || extraTranslations ) {
		setLocaleData( allTranslations, domain );
	}
};
