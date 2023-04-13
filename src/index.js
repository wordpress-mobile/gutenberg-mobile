/**
 * WordPress dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import { getTranslation as getJetpackTranslation } from './i18n-cache/jetpack';
import { getTranslation as getLayoutGridTranslation } from './i18n-cache/layout-grid';
import { getTranslation as getJetpackVideoPressTranslation } from './i18n-cache/jetpack-videopress-pkg';

const pluginTranslations = [
	{
		domain: 'jetpack',
		getTranslation: getJetpackTranslation,
	},
	{
		domain: 'layout-grid',
		getTranslation: getLayoutGridTranslation,
	},
	{
		domain: 'jetpack-videopress-pkg',
		getTranslation: getJetpackVideoPressTranslation,
	},
];

export default function registerGutenbergMobile() {
	registerGutenberg( {
		beforeInitCallback: () => {
			// We have to lazy import the setup code to prevent executing any code located
			// at global scope before the editor is initialized, like translations retrieval.
			require( './setup' ).default();

			// Set up Jetpack
			require( './jetpack-editor-setup' ).default();

			// Set up Block experiments (i.e. Layout Grid block)
			require( './block-experiments-setup' ).default();
		},
		pluginTranslations,
	} );
}

registerGutenbergMobile();
