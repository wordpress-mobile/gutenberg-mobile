/**
 * WordPress dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import { getTranslation as getJetpackTranslation } from './i18n-cache/jetpack';
import { getTranslation as getLayoutGridTranslation } from './i18n-cache/layout-grid';
import correctTextFontWeight from './text-font-weight-correct';
import initialHtml from './initial-html';

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

export default function registerGutenbergMobile() {
	registerGutenberg( {
		beforeInitCallback: () => {
			// We have to lazy import the setup code to prevent executing any code located
			// at global scope before the editor is initialized, like translations retrieval.
			require( './setup' ).default();
		},
		pluginTranslations,
	} );
}

registerGutenbergMobile();
