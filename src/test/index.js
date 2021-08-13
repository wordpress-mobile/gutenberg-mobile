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

		require( '../allowed-blocks-setup' );

		expect( mockRegisterBlockCollection.mock.calls[ 0 ][ 0 ] ).toBe(
			'jetpack'
		);
	} );
} );
