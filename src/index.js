/**
 * Internal dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

registerGutenberg( () => {
	const { default: gutenbergMobileSetup } = require( './setup' );
	gutenbergMobileSetup();
} );
