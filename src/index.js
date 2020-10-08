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
	require( './strings-overrides' );
	correctTextFontWeight();
	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);
} );

addFilter( 'native.block_editor_props', 'gutenberg-mobile', ( editorProps ) => {
	if ( __DEV__ ) {
		let { initialTitle } = editorProps;

		if ( initialTitle === undefined ) {
			initialTitle = 'Welcome to gutenberg for WP Apps!';
		}

		return {
			...editorProps,
			initialTitle,
		};
	}
	return editorProps;
} );

require( '@wordpress/react-native-editor' );
