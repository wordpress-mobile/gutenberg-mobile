/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/extensions/shared/get-jetpack-data';
/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';

// When adding new blocks to this list please also consider updating ./block-support/supported-blocks.json
const supportedJetpackBlocks = {
	'contact-info': {
		available: true,
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

export default ( jetpackState ) => {
	if ( ! jetpackState.isJetpackActive ) {
		return;
	}

	const jetpackData = setJetpackData( jetpackState );

	const mediaFilesCollectionBlock = useSelect( ( select ) => {
		return select( 'core/block-editor' ).getSettings( 'capabilities' )
			.mediaFilesCollectionBlock;
	}, [] );

	if ( mediaFilesCollectionBlock !== true ) {
		useDispatch( 'core/edit-post' ).hideBlockTypes( [ 'jetpack/story' ] );
	} else {
		useDispatch( 'core/edit-post' ).showBlockTypes( [ 'jetpack/story' ] );
	}

	if ( __DEV__ ) {
		require( '../jetpack/extensions/editor' );
	}

	return jetpackData;
};
