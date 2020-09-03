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
	if ( __DEV__ ) {
		// I am not sure this is the right way to do this. 
		// But if I do an import instead we end up with an error.
		require( './block-experiments-setup' );
	}
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
