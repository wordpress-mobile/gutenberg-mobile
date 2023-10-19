/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';

describe( 'Gutenberg Editor Visual test for Gallery Block', () => {
	it( 'should be able to render the placeholder correctly', async () => {
		await editorPage.initializeEditor();
		await editorPage.addNewBlock( blockNames.gallery );
		await editorPage.closeMediaPicker();

		// Visual test check
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
	} );

	it( 'should be able to render a gallery correctly', async () => {
		await editorPage.initializeEditor( {
			initialData: [ e2eTestData.galleryBlock ].join( '\n\n' ),
		} );
		const galleryBlock = await editorPage.getBlockAtPosition(
			blockNames.gallery
		);
		expect( galleryBlock ).toBeTruthy();

		// Wait for images to load
		await editorPage.driver.pause( 5000 );

		// Visual test check
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
