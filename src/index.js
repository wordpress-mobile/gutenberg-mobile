/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import setupJetpackEditor from './jetpack-editor-setup';

addAction( 'native.pre-render', 'gutenberg-mobile', ( props ) => {
	correctTextFontWeight();
	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);
} );

addFilter( 'native.block_editor_props_default', 'gutenberg-mobile', ( coreNativeProps ) => {
	return {
		...coreNativeProps,
		initialTitle: 'Welcome to gutenberg for WP Apps!'
	};
} );

require( '@wordpress/react-native-editor' );
