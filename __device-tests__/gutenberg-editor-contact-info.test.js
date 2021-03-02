/**
 * Internal dependencies
 */
describe( 'Gutenberg Editor Contact Info Block tests', () => {
	// const contactInfoBlockName = 'Contact Info';

	it( 'should be able to see visual editor', async () => {
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	//TODO: Add tests
} );
