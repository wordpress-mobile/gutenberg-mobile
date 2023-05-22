/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { toggleOrientation, swipeUp } = e2eUtils;
import { takeScreenshot } from './utils';
import {
	NESTED_COLUMNS_CASE_1,
	NESTED_COLUMNS_CASE_2,
} from './test-editor-data';

describe( 'Gutenberg Editor iPad Visual test for Horizontal layouts', () => {
	it( 'should show the right columns placeholders and alignments case 1', async () => {
		await editorPage.setHtmlContent( NESTED_COLUMNS_CASE_1 );

		// Wait for images to load
		await editorPage.driver.sleep( 4000 );

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		await titleElement.click();

		await editorPage.dismissKeyboard();

		// Visual test check
		let screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Switch to landscape
		await toggleOrientation( editorPage.driver );
		// Wait for the device to finish rotating
		await editorPage.driver.sleep( 3000 );

		await swipeUp( editorPage.driver );
		await swipeUp( editorPage.driver );
		await swipeUp( editorPage.driver );

		// Wait for the scrollbar to hide
		await editorPage.driver.sleep( 3000 );

		// Visual test check
		screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Switch to portrait
		await toggleOrientation( editorPage.driver );
		// Wait for the device to finish rotating
		await editorPage.driver.sleep( 3000 );

		// Remvoe blocks
		const coverBlock = await editorPage.getBlockAtPosition(
			blockNames.cover
		);
		await coverBlock.click();

		await editorPage.moveBlockSelectionUp();

		await editorPage.removeBlock();

		for ( let i = 3; i > 0; i-- ) {
			const columnsBlock = await editorPage.getBlockAtPosition(
				blockNames.columns
			);
			await columnsBlock.click();

			await editorPage.moveBlockSelectionUp( { toRoot: true } );

			await editorPage.removeBlock();
		}
	} );

	it( 'should show the right columns placeholders and alignments case 2', async () => {
		await editorPage.setHtmlContent( NESTED_COLUMNS_CASE_2 );

		// Wait for images to load
		await editorPage.driver.sleep( 4000 );

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		await titleElement.click();

		await editorPage.dismissKeyboard();

		// Visual test check
		let screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Switch to landscape
		await toggleOrientation( editorPage.driver );
		// Wait for the device to finish rotating
		await editorPage.driver.sleep( 3000 );

		await swipeUp( editorPage.driver );
		await swipeUp( editorPage.driver );

		// Wait for the scrollbar to hide
		await editorPage.driver.sleep( 3000 );

		// Visual test check
		screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Switch to portrait
		await toggleOrientation( editorPage.driver );
		// Wait for the device to finish rotating
		await editorPage.driver.sleep( 3000 );
	} );
} );
