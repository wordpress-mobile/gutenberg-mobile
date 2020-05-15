/**
 * WordPress dependencies
 */
import { addAction } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import setupJetpackEditor from './jetpack-editor-setup';

addAction( 'native.render', 'core/react-native-editor', ( props ) => {
	correctTextFontWeight();
	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);
} );

require( '@wordpress/react-native-editor' );
