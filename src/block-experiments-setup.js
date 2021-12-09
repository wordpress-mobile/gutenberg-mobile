/**
 * Internal dependencies
 */
// This file is to set up the jetpack/layout-grid block that currently lives in block-experiments/blocks/layout-grid
import { registerBlock } from '../block-experiments/blocks/layout-grid/src';
import setupLocale from './setup-locale';
import { getTranslation as getLayoutGridTranslation } from './i18n-translations/layout-grid';

const LAYOUT_GRID_LOCALE_DOMAIN = 'layout-grid';

export function setupBlockExperiments( capabilities ) {
	if ( capabilities.layoutGridBlock ) {
		registerBlock();
	}
}

export function setupBlockExperimentsLocale( locale, extraTranslations ) {
	// Setup locale for Layout Grid
	setupLocale( {
		domain: LAYOUT_GRID_LOCALE_DOMAIN,
		locale,
		extraTranslations,
		getTranslation: getLayoutGridTranslation,
	} );
}
