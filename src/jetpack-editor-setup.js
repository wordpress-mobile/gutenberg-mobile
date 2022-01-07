/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { store as editPostStore } from '@wordpress/edit-post';
import { addAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';
import isActive from '../jetpack/projects/plugins/jetpack/extensions/shared/is-active';
import {
	reactivateFacebookEmbedBlockVariation,
	reactivateInstagramEmbedBlockVariation,
	registerLoomVariation,
	registerSmartframeVariation,
} from '../jetpack/projects/plugins/jetpack/extensions/extended-blocks/core-embed';

// When adding new blocks to this list please also consider updating ./block-support/supported-blocks.json
const supportedJetpackBlocks = {
	'contact-info': {
		available: true,
	},
	story: {
		available: true,
	},
	'tiled-gallery': {
		available: __DEV__,
	},
};

const setJetpackData = ( {
	isJetpackActive = false,
	userData = null,
	siteFragment = null,
	blogId,
} ) => {
	const availableBlocks = supportedJetpackBlocks;
	const jetpackEditorInitialState = {
		available_blocks: availableBlocks,
		jetpack: {
			is_active: isJetpackActive,
		},
		siteFragment,
		tracksUserData: userData,
		wpcomBlogId: blogId,
	};
	global.window[ JETPACK_DATA_PATH ] = jetpackEditorInitialState;
	return jetpackEditorInitialState;
};

const hideBlockByCapability = ( capability, blockName ) => {
	if ( capability !== true ) {
		dispatch( editPostStore ).hideBlockTypes( [ blockName ] );
	} else {
		dispatch( editPostStore ).showBlockTypes( [ blockName ] );
	}
};

export function setupJetpackEditor( jetpackState ) {
	if ( ! jetpackState.isJetpackActive ) {
		return;
	}

	return setJetpackData( jetpackState );
}

export function registerJetpackBlocks( { capabilities } ) {
	if ( ! isActive() ) {
		return;
	}
	hideBlockByCapability(
		capabilities.mediaFilesCollectionBlock,
		'jetpack/story'
	);
	hideBlockByCapability(
		capabilities.contactInfoBlock,
		'jetpack/contact-info'
	);
	hideBlockByCapability( true, 'jetpack/tiled-gallery' );

	// Register Jetpack blocks
	require( '../jetpack/projects/plugins/jetpack/extensions/editor' );
}

export function registerJetpackEmbedVariations( { capabilities } ) {
	if ( ! isActive() ) {
		return;
	}

	// Register Jetpack Embed variations
	[
		{
			// Facebook embed
			capability: capabilities.facebookEmbed,
			registerFunc: reactivateFacebookEmbedBlockVariation,
		},
		{
			// Instagram embed
			capability: capabilities.instagramEmbed,
			registerFunc: reactivateInstagramEmbedBlockVariation,
		},
		{
			// Loom embed
			capability: capabilities.loomEmbed,
			registerFunc: registerLoomVariation,
		},
		{
			// Smartframe embed
			capability: capabilities.smartframeEmbed,
			registerFunc: registerSmartframeVariation,
		},
	].forEach( ( { capability, registerFunc } ) => {
		if ( capability === true ) {
			registerFunc();
		}
	} );
}

const setupHooks = () => {
	// Hook triggered before the editor is rendered
	addAction( 'native.pre-render', 'gutenberg-mobile-jetpack', ( props ) => {
		const { jetpackState } = props;

		setupJetpackEditor(
			jetpackState || { blogId: 1, isJetpackActive: true }
		);

		// Jetpack Embed variations use WP hooks that are attached to
		// block type registration, so it’s required to add them before
		// the core blocks are registered.
		registerJetpackEmbedVariations( props );
	} );

	// Hook triggered after the editor is rendered
	addAction( 'native.render', 'gutenberg-mobile-jetpack', ( props ) => {
		registerJetpackBlocks( props );
	} );
};

export default () => {
	setupHooks();
};
