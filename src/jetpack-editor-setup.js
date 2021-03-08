/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';
/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

// When adding new blocks to this list please also consider updating ./block-support/supported-blocks.json
const supportedJetpackBlocks = {
	'contact-info': {
		available: __DEV__,
	},
	story: {
		available: true,
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

export default ( jetpackState, capabilities ) => {
	if ( ! jetpackState.isJetpackActive ) {
		return;
	}

	const jetpackData = setJetpackData( jetpackState );

	const toggleBlock = ( capability, blockName ) => {
		if ( capability !== true ) {
			dispatch( 'core/edit-post' ).hideBlockTypes( [ blockName ] );
		} else {
			dispatch( 'core/edit-post' ).showBlockTypes( [ blockName ] );
		}
	};

	toggleBlock( capabilities.mediaFilesCollectionBlock, 'jetpack/story' );
	toggleBlock( capabilities.contactInfoBlock, 'jetpack/contact-info' );

	require( '../jetpack/projects/plugins/jetpack/extensions/editor' );

	return jetpackData;
};
