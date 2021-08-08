/**
 * External dependencies
 */
import { map as _map, without as _without } from 'lodash';
/**
 * WordPress dependencies
 */
import { dispatch as _dispatch } from '@wordpress/data';
import { getBlockTypes as _getBlockTypes } from '@wordpress/blocks';

export default (
	props = {},
	dependencies = {
		dispatch: _dispatch,
		getBlockTypes: _getBlockTypes,
		map: _map,
		setTimeout,
		without: _without,
	}
) => {
	const { dispatch, getBlockTypes, map, setTimeout, without } = dependencies;
	const {
		showBlocks = [
			// 'core/audio',
			// 'jetpack/contact-info',
			// 'jetpack/story',
			// 'jetpack/layout-grid',
		],
		hideBlocks = [
			// 'core/audio',
			// 'jetpack/contact-info',
			// 'jetpack/story',
			// 'jetpack/layout-grid',
		],
	} = props;

	setTimeout( () => {
		const blocks = map( getBlockTypes(), 'name' );
		const uniqueHideBlocks = [ ...new Set( hideBlocks ) ];
		const uniqueShowBlocks = [ ...new Set( showBlocks ) ];
		const differenceHideBlocks = without( blocks, ...uniqueShowBlocks );
		const differenceShowBlocks = without( blocks, ...uniqueHideBlocks );

		if ( uniqueHideBlocks.length > 0 ) {
			dispatch( 'core/edit-post' ).hideBlockTypes( uniqueHideBlocks );
			dispatch( 'core/edit-post' ).showBlockTypes( differenceShowBlocks );
		}

		if ( uniqueShowBlocks.length > 0 ) {
			dispatch( 'core/edit-post' ).showBlockTypes( uniqueShowBlocks );
			dispatch( 'core/edit-post' ).hideBlockTypes( differenceHideBlocks );
		}
	} );
};
