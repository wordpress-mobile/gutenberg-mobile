import { addAction } from "@wordpress/hooks";

describe( 'Test Block Editor rendering hooks', () => {

	beforeEach( () => {
		const cache = require.cache;
		for ( const moduleId in cache ) {
			delete cache[ moduleId ];
		}
	} );

	it( 'should call `native.render` before rendering the editor', ( done ) => {
		addAction( 'native.render', 'core/react-native-editor', () => {
			done();
		} );

		require( '@wordpress/react-native-editor' );
	} );

	it( 'should call `native.render` with the main editor props', ( done ) => {
		addAction( 'native.render', 'core/react-native-editor', ( props ) => {
			expect( props ).toBe( {
				initialHtml: '',
				initialHtmlModeEnabled: false,
				initialTitle: 'Welcome to Gutenberg!',
				postType: 'post',
			} );
			done();
		} );

		require( '@wordpress/react-native-editor' );
	} );
} );
