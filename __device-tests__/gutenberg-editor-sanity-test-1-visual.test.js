/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';
const { toggleOrientation, isAndroid } = e2eUtils;

describe( 'Gutenberg Editor - Test Suite 4', () => {
	describe( 'Columns block', () => {
		it( 'displays placeholders when unselected', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss coluns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
			// Select title to unfocus the block
			const titleElement = await editorPage.getTitleElement();
			await titleElement.click();
			await editorPage.dismissKeyboard();

			// Visual test check for portrait orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );
			const columnsBlock = await editorPage.getBlockAtPosition(
				blockNames.columns
			);
			await columnsBlock.click();
			await editorPage.removeBlock();
		} );

		it( 'displays correctly in portrait and landscape orientations', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss coluns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();

			// Click the block appender within the first column
			await editorPage.driver
				.elementByAccessibilityId( 'Column Block. Row 1' )
				.click()
				.click();

			// Click the Columns block type button
			const blockButton = await editorPage.findBlockButton(
				blockNames.columns
			);
			if ( isAndroid() ) {
				await blockButton.click();
			} else {
				await editorPage.driver.execute( 'mobile: tap', {
					element: blockButton,
					x: 10,
					y: 10,
				} );
			}

			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss coluns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
			// Navigate upwards in block hierarchy, briefly wait for selection update
			await editorPage.driver
				.elementByAccessibilityId( 'Navigate Up' )
				.click()
				.click();
			await editorPage.driver.sleep( 1000 );

			// Visual test check for portrait orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );
			const columnsBlock = await editorPage.getBlockAtPosition(
				blockNames.columns
			);
			await columnsBlock.click();
			await editorPage.removeBlock();
		} );
	} );
} );
