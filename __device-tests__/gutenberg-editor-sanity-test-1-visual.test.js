/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';
const {
	toggleOrientation,
	isAndroid,
	swipeFromTo,
	toggleDarkMode,
	isEditorVisible,
} = e2eUtils;

describe( 'Gutenberg Editor - Test Suite 1', () => {
	describe( 'Columns block', () => {
		it( 'displays placeholders when unselected', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );
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
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click();
				const appenderButton = await editorPage.waitForElementToBeDisplayedByXPath(
					'(//android.view.ViewGroup[@content-desc="block-list"])[2]/android.widget.Button'
				);
				await appenderButton.click();
			} else {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click()
					.click();
			}

			await editorPage.addNewBlock( blockNames.columns, {
				skipInserterOpen: true,
			} );

			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );
			// Navigate upwards in block hierarchy
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
			await editorPage.removeBlock();
		} );

		it( 'mover buttons display in the correct positions', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click();
				const appenderButton = await editorPage.waitForElementToBeDisplayedByXPath(
					'(//android.view.ViewGroup[@content-desc="block-list"])[2]/android.widget.Button'
				);
				await appenderButton.click();
			} else {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click()
					.click();
			}

			await editorPage.addNewBlock( blockNames.columns, {
				skipInserterOpen: true,
			} );

			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );

			// Visual test check for landscape orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Navigate upwards in block hierarchy
			await editorPage.driver
				.elementByAccessibilityId( 'Navigate Up' )
				.click();
			await editorPage.driver.sleep( 1000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.sleep( 3000 );
			// Navigate upwards in block hierarchy
			await editorPage.driver
				.elementByAccessibilityId( 'Navigate Up' )
				.click();
			await editorPage.driver.sleep( 1000 );
			await editorPage.removeBlock();
		} );

		it( 'displays with correct colors with dark mode enabled', async () => {
			await toggleDarkMode( editorPage.driver, true );

			// The Android editor requires a restart to apply dark mode
			if ( isAndroid() ) {
				await editorPage.driver.resetApp();
				await isEditorVisible( editorPage.driver );
			}

			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

			// Visual test check for placeholders
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click();
				const appenderButton = await editorPage.waitForElementToBeDisplayedByXPath(
					'(//android.view.ViewGroup[@content-desc="block-list"])[2]/android.widget.Button'
				);
				await appenderButton.click();
			} else {
				await editorPage.driver
					.elementByAccessibilityId( 'Column Block. Row 1' )
					.click()
					.click();
			}

			// Append a Preformatted block
			const blockButton = await editorPage.findBlockButton(
				blockNames.preformatted
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

			// TODO: determine a way to type a text block nested within a Columns block

			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );
			// Navigate upwards in block hierarchy
			await editorPage.driver
				.elementByAccessibilityId( 'Navigate Up' )
				.click()
				.click();
			await editorPage.waitForKeyboardToBeHidden();

			// Visual test check for nested content
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await editorPage.removeBlock();
			await toggleDarkMode( editorPage.driver, false );

			// The Android editor requires a restart to apply dark mode
			if ( isAndroid() ) {
				await editorPage.driver.resetApp();
				await isEditorVisible( editorPage.driver );
			}
		} );

		it( 'sliders display proportionate fill level previews', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			await editorPage.dismissBottomSheet();
			await editorPage.openBlockSettings();
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );

			const cellId = isAndroid()
				? 'Column 1. Width is 50 Percent (%)., double-tap to change unit'
				: 'Column 1. Width is 50 Percent (%).';
			const cell = await editorPage.driver.elementByAccessibilityId(
				cellId
			);
			const cellSize = await cell.getSize();
			const cellLocation = await cell.getLocation();
			const scrollOffset = isAndroid() ? 350 : 100;

			// Reveal default column width cells
			await swipeFromTo(
				editorPage.driver,
				{
					x: cellLocation.x + cellSize.width / 2,
					y: cellLocation.y + cellSize.height / 2,
				},
				{
					x: cellLocation.x + cellSize.width / 2,
					y: cellLocation.y + cellSize.height / 2 - scrollOffset,
				},
				1000
			);
			// Shrink the first column
			await swipeFromTo(
				editorPage.driver,
				{
					x: cellLocation.x + cellSize.width * 0.42,
					y: cellLocation.y - scrollOffset + cellSize.height * 0.69,
				},
				{
					x:
						cellLocation.x +
						cellSize.width * 0.42 -
						cellSize.width * 0.15,
					y: cellLocation.y - scrollOffset + cellSize.height * 0.69,
				},
				1000
			);

			// Visual test check for adjusted columns
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await editorPage.dismissBottomSheet();
			await editorPage.removeBlock();
		} );
	} );
} );
