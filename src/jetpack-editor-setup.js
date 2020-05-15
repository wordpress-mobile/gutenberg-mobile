/** @format */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { JETPACK_DATA_PATH } from '../jetpack/extensions/shared/get-jetpack-data';

const setJetpackData = async ( {
	isJetpackActive = true,
	userData = null,
	siteFragment = null,
	blogId,
} ) => {
	let availableBlocks = {};
	if ( isJetpackActive ) {
		console.log( 'Fetching /wpcom/v2/gutenberg/available-extensions' );
		try {
			availableBlocks = await apiFetch( { path: `/wpcom/v2/gutenberg/available-extensions` } );
		} catch ( error ) {
			console.warn( 'Error while fetching available extensions', error );
			// manually set availableBlocks while WP REST API auth is being worked on
			availableBlocks = {};
		}
	}

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

export default async ( jetpackState ) => {
	if ( ! jetpackState.isJetpackActive ) {
		return;
	}

	const jetpackData = await setJetpackData( jetpackState );

	if ( __DEV__ ) {
		require( '../jetpack/extensions/editor' );
	}

	return jetpackData;
};
