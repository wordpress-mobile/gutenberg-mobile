describe( 'Test Jetpack blocks', () => {
	it( 'should setup the editor for jetpack without failing', () => {
		const mockRegisterBlockCollection = jest.fn();
		jest.mock( '@wordpress/blocks', () => {
			return {
				getCategories: () => [ { slug: 'media' } ],
				setCategories: jest.fn(),
				registerBlockCollection: mockRegisterBlockCollection,
				withBlockContentContext: jest.fn(),
			};
		} );
		jest.mock(
			'../../jetpack/projects/plugins/jetpack/extensions/blocks/contact-info/editor.js',
			() => jest.fn()
		);
		jest.mock(
			'../../jetpack/projects/plugins/jetpack/extensions/blocks/story/editor.js',
			() => jest.fn()
		);
		jest.mock(
			'../../jetpack/projects/plugins/jetpack/extensions/blocks/tiled-gallery/editor.js',
			() => jest.fn()
		);

		const setupJetpackEditor = require( '../jetpack-editor-setup' ).default;
		setupJetpackEditor( { blogId: 1, isJetpackActive: true } );

		expect( mockRegisterBlockCollection.mock.calls[ 0 ][ 0 ] ).toBe(
			'jetpack'
		);
	} );
} );
