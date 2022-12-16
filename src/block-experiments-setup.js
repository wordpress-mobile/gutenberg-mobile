/**
 * WordPress dependencies
 */
import { addAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
// This file is to set up the jetpack/layout-grid block that currently lives in block-experiments/blocks/layout-grid
import { registerBlock } from '../block-experiments/blocks/layout-grid/src';

const setupHooks = () => {
	// Hook triggered after the editor is rendered
	addAction(
		'native.render',
		'gutenberg-mobile-block-experiments',
		( props ) => {
			const capabilities = props.capabilities ?? {};

			// Register Layout Grid block (`jetpack/layout-grid`)
			if (
				capabilities.layoutGridBlock &&
				! capabilities.onlyCoreBlocks
			) {
				registerBlock();
			}
		}
	);
};

export default () => {
	setupHooks();
};
