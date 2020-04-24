
const wpHooks = require( '@wordpress/hooks' );

wpHooks.addAction( 'native.render', 'core/react-native-editor', ( props ) => {
	console.log( 'rendered from gutenberg-mobile', props );
} );

require( '@wordpress/react-native-editor' );

