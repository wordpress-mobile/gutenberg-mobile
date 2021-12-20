/**
 * WordPress dependencies
 */
import { registerGutenberg } from '@wordpress/react-native-editor';

registerGutenberg( {
	beforeInitCallback: () => {
		// We have to lazy import the setup code to prevent executing any code located
		// at global scope before the editor is initialized, like translations retrieval.
		const { default: gutenbergMobileSetup } = require( './setup' );
		gutenbergMobileSetup();
	},
} );
