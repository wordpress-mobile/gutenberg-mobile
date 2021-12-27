/**
 * WordPress dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import { getTranslation as getJetpackTranslation } from './i18n-translations/jetpack';
import { getTranslation as getLayoutGridTranslation } from './i18n-translations/layout-grid';

const pluginTranslations = [
	{
		domain: 'jetpack',
		getTranslation: getJetpackTranslation,
	},
	{
		domain: 'layout-grid',
		getTranslation: getLayoutGridTranslation,
	},
];

registerGutenberg( {
	beforeInitCallback: () => {
		// We have to lazy import the setup code to prevent executing any code located
		// at global scope before the editor is initialized, like translations retrieval.
		const { default: gutenbergMobileSetup } = require( './setup' );
		gutenbergMobileSetup();
	},
	pluginTranslations,
} );
