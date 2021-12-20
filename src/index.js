/**
 * WordPress dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

registerGutenberg( {
	beforeInitCallback: () => {
		const { default: gutenbergMobileSetup } = require( './setup' );
		gutenbergMobileSetup();
	},
} );
