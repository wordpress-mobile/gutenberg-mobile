/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
// This file is to set up the jetpack/layout-grid block that currently lives in block-experiments/blocks/layout-grid
import { registerBlock } from '../block-experiments/blocks/layout-grid/src';

const blockExperiments = [ 'jetpack/layout-grid' ];

const setupHooks = () => {
	// Hook triggered after the editor is rendered
	addAction(
		'native.post-register-core-blocks',
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

const setupStringsOverrides = () => {
	addFilter(
		'native.missing_block_detail',
		'native/missing_block',
		( defaultValue, blockName ) => {
			const { capabilities } = select( blockEditorStore ).getSettings();
			const onlyCoreBlocks = capabilities?.onlyCoreBlocks === true;

			if ( onlyCoreBlocks && blockExperiments.includes( blockName ) ) {
				return null;
			}
			return defaultValue;
		}
	);
};

export default () => {
	setupHooks();
	setupStringsOverrides();
};
