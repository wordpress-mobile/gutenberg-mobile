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
	registerTiledGalleryBlock as registerJetpackTiledGalleryBlock,
} from '../jetpack/projects/plugins/jetpack/extensions/editor.native';

// Please also consider updating ./block-support/supported-blocks.json
const availableJetpackBlocks = {
	'contact-info': { available: true },
	'layout-grid': { available: true },
	story: { available: true },
	'tiled-gallery': { available: true },
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
			tiledGalleryBlock = false,
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

	if ( tiledGalleryBlock ) {
		registerTiledGalleryBlock();
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
	const registeredBlocks = getBlockTypes().map( ( { name } ) => name );
	const { showBlocks = registeredBlocks, hideBlocks = [] } = props;
	const wereShowBlocksProvided = showBlocks !== registeredBlocks;
	const uniqueRegisteredHideBlocks = hideBlocks.filter( ( name, index ) => {
		return (
			// Is Unique?
			hideBlocks.indexOf( name ) === index &&
			// Is Unambiguous?
			( ! wereShowBlocksProvided || ! showBlocks.includes( name ) ) &&
			// Is Registered?
			registeredBlocks.includes( name )
		);
	} );
	const uniqueRegisteredShowBlocks = ! wereShowBlocksProvided
		? showBlocks
		: showBlocks.filter( ( name, index ) => {
				return (
					// Is Unique?
					showBlocks.indexOf( name ) === index &&
					// Is Unambiguous?
					! hideBlocks.includes( name ) &&
					// Is Registered?
					registeredBlocks.includes( name )
				);
		  } );
	const wereShowBlocksFilteredDownToAnEmptySet =
		wereShowBlocksProvided &&
		showBlocks.length > 0 &&
		uniqueRegisteredShowBlocks.length === 0;
	const invertRegisteredShowBlocks = wereShowBlocksFilteredDownToAnEmptySet
		? []
		: registeredBlocks.filter( ( name ) => {
				return ! uniqueRegisteredShowBlocks.includes( name );
		  } );
	const hiddenBlockTypes = [
		...uniqueRegisteredHideBlocks,
		...invertRegisteredShowBlocks,
	];

	if ( hiddenBlockTypes.length > 0 ) {
		dispatch( 'core/edit-post' ).hideBlockTypes( [
			...new Set( hiddenBlockTypes ),
		] );
	}
};

export const setupBlocks = ( props = {} ) => {
	setupJetpackBlocks( props );
	setupAllowedBlocks( props );
};
