/**
 * External dependencies
 */
import wd from 'wd';

/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';
const { toggleOrientation, isAndroid, swipeFromTo } = e2eUtils;

describe( 'Gutenberg Editor - Test Suite 4', () => {
	describe( 'Columns block', () => {
		it( 'displays placeholders when unselected', async () => {
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
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
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

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
			// Dismiss columns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
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
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

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
			// Dismiss columns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
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
			if ( isAndroid() ) {
				await editorPage.driver.executeScript( 'mobile: shell', [
					{
						command: 'settings put system ui_night_mode 2',
					},
				] );
			} else {
				await editorPage.driver.execute( 'mobile: setAppearance', {
					style: 'dark',
				} );
			}

			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.sleep( 3000 );
			// Dismiss columns layout picker
			await editorPage.driver
				.elementByAccessibilityId( 'Cancel' )
				.click();
			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

			// Visual test check for placeholders
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Click the block appender within the first column
			await editorPage.driver
				.elementByAccessibilityId( 'Column Block. Row 1' )
				.click()
				.click();

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
			if ( isAndroid() ) {
				await editorPage.driver.executeScript( 'mobile: shell', [
					{
						command: 'settings put system ui_night_mode 1',
					},
				] );
			} else {
				await editorPage.driver.execute( 'mobile: setAppearance', {
					style: 'light',
				} );
			}
		} );
	} );

	it( 'sliders display proportionate fill level previews', async () => {
		await editorPage.addNewBlock( blockNames.columns );
		// Wait for the modal to open
		await editorPage.driver.sleep( 3000 );
		await editorPage.driver.elementByAccessibilityId( 'Cancel' ).click();
		await editorPage.openBlockSettings();
		// Wait for the modal to open
		await editorPage.driver.sleep( 3000 );

		// Reveal default column width sliders
		await swipeFromTo(
			editorPage.driver,
			{ x: 180, y: 625 },
			{ x: 180, y: 425 },
			3000
		);
		// Shrink first column
		await swipeFromTo(
			editorPage.driver,
			{ x: 165, y: 626 },
			{ x: 100, y: 626 },
			3000
		);

		// Visual test check for adjusted columns
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Dismiss block settings by tapping the modal overlay
		const action = new wd.TouchAction( editorPage.driver );
		action.tap( { x: 100, y: 100 } );
		await action.perform();

		await editorPage.removeBlock();
	} );
} );
