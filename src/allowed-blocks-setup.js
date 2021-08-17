/**
 * External dependencies
 */
import { map, without } from 'lodash';
/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { getBlockTypes } from '@wordpress/blocks';
/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';
import { registerBlock as registerJetpackLayoutGridBlock } from '../block-experiments/blocks/layout-grid/src';
import {
	registerContactInfoBlock as registerJetpackContactInfoBlock,
	registerStoryBlock as registerJetpackStoryBlock,
} from '../jetpack/projects/plugins/jetpack/extensions/editor.native';

// Please also consider updating ./block-support/supported-blocks.json
const availableJetpackBlocks = {
	'contact-info': { available: true },
	'layout-grid': { available: true },
	story: { available: true },
};

const mapToJetpackData = ( {
	isJetpackActive = false,
	userData: tracksUserData = null,
	siteFragment = null,
	blogId: wpcomBlogId = 1,
} ) => {
	return {
		siteFragment,
		tracksUserData,
		wpcomBlogId,
		jetpack: { is_active: isJetpackActive },
		available_blocks: availableJetpackBlocks,
	};
};

const registerJetpackBlocksIfCapable = ( props = {} ) => {
	const {
		capabilities: {
			layoutGridBlock = false,
			mediaFilesCollectionBlock = false,
			contactInfoBlock = false,
		} = {},
	} = props;

	if ( layoutGridBlock ) {
		registerJetpackLayoutGridBlock();
	}

	if ( mediaFilesCollectionBlock ) {
		registerJetpackStoryBlock();
	}

	if ( contactInfoBlock ) {
		registerJetpackContactInfoBlock();
	}
};

export const setupJetpackBlocks = ( props = {} ) => {
	const { jetpackState = { blogId: 1, isJetpackActive: true } } = props;
	const { isJetpackActive = false } = jetpackState;

	if ( isJetpackActive ) {
		global.window[ JETPACK_DATA_PATH ] = mapToJetpackData( jetpackState );
		registerJetpackBlocksIfCapable( props );
	}
};

export const setupAllowedBlocks = ( props = {} ) => {
	const { showBlocks = [], hideBlocks = [] } = props;
	const blocks = map( getBlockTypes(), 'name' );
	const uniqueHideBlocks = [ ...new Set( hideBlocks ) ];
	const uniqueShowBlocks = [ ...new Set( showBlocks ) ];
	const differenceHideBlocks = without( blocks, ...uniqueShowBlocks );

	if ( uniqueHideBlocks.length > 0 ) {
		dispatch( 'core/edit-post' ).hideBlockTypes( uniqueHideBlocks );
	}

	if ( uniqueShowBlocks.length > 0 ) {
		dispatch( 'core/edit-post' ).hideBlockTypes( differenceHideBlocks );
	}
};

export const setupBlocks = ( props = {} ) => {
	setupJetpackBlocks( props );
	setupAllowedBlocks( props );
};
