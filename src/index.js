/**
 * WordPress dependencies
 */
import { gutenbergSetup, registerApp } from '@wordpress/react-native-editor';

gutenbergSetup();

const wpHooks = require( '@wordpress/hooks' );

wpHooks.addAction( 'native.render', 'core/react-native-editor', ( props ) => {
	console.log( 'rendered from gutenberg-mobile', props );
} );

registerApp();
