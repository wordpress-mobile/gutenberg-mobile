/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot, takeScreenshotByElement } from './utils';
const {
	clickIfClickable,
	toggleOrientation,
	isAndroid,
	swipeFromTo,
	toggleDarkMode,
	typeString,
	waitForVisible,
} = e2eUtils;
import { NESTED_COLUMNS_3_LEVELS } from './test-editor-data';

const ANDROID_COLUMN_APPENDER_BUTTON_XPATH =
	'//android.widget.Button[@content-desc="Column Block. Row 1"]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.Button';

describe( 'Gutenberg Editor - Test Suite 1', () => {
	describe( 'Columns block', () => {
		it( 'displays placeholders when unselected', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );
			// Select title to unfocus the block
			const titleElement = await editorPage.getTitleElement();
			await titleElement.click();
			await editorPage.dismissKeyboard();

			await editorPage.driver.waitUntil( async function () {
				return ! ( await editorPage.driver.isKeyboardShown() );
			} );

			// Visual test check for portrait orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );
		} );

		it( 'displays correctly in portrait and landscape orientations', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver.$( '~Column Block. Row 1' ).click();
				const appenderButton =
					await editorPage.waitForElementToBeDisplayedByXPath(
						ANDROID_COLUMN_APPENDER_BUTTON_XPATH
					);
				await appenderButton.click();
			} else {
				const firstColum = await editorPage.driver.$(
					'~Column Block. Row 1'
				);
				await firstColum.click();
				await firstColum.click();
			}

			await editorPage.addNewBlock( blockNames.columns, {
				skipInserterOpen: true,
			} );

			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );
			// Navigate upwards in block hierarchy
			await editorPage.moveBlockSelectionUp( { toRoot: true } );
			await editorPage.driver.pause( 1000 );

			// Visual test check for portrait orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );
		} );

		it( 'mover buttons display in the correct positions', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver.$( '~Column Block. Row 1' ).click();
				const appenderButton =
					await editorPage.waitForElementToBeDisplayedByXPath(
						ANDROID_COLUMN_APPENDER_BUTTON_XPATH
					);
				await appenderButton.click();
			} else {
				const firstColum = await editorPage.driver.$(
					'~Column Block. Row 1'
				);
				await firstColum.click();
				await firstColum.click();
			}

			await editorPage.addNewBlock( blockNames.columns, {
				skipInserterOpen: true,
			} );

			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );

			// Visual test check for landscape orientation
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Navigate upwards in block hierarchy
			await editorPage.moveBlockSelectionUp();
			await editorPage.driver.pause( 1000 );

			// Visual test check for landscape orientation
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );
			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );
		} );

		it( 'displays with correct colors with dark mode enabled', async () => {
			await toggleDarkMode( editorPage.driver, true );
			await editorPage.initializeEditor();

			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			// Dismiss columns layout picker
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );

			// Visual test check for placeholders
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Click the block appender within the first column
			if ( isAndroid() ) {
				await editorPage.driver.$( '~Column Block. Row 1' ).click();
				const appenderButton =
					await editorPage.waitForElementToBeDisplayedByXPath(
						ANDROID_COLUMN_APPENDER_BUTTON_XPATH
					);
				await appenderButton.click();
			} else {
				const firstColum = await editorPage.driver.$(
					'~Column Block. Row 1'
				);
				await firstColum.click();
				await firstColum.click();
			}

			// Append a Preformatted block
			const blockButton = await editorPage.findBlockButton(
				blockNames.preformatted
			);
			await blockButton.click();

			// TODO: determine a way to type a text block nested within a Columns block

			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );
			// Navigate upwards in block hierarchy
			await editorPage.moveBlockSelectionUp( { toRoot: true } );
			await editorPage.waitForKeyboardToBeHidden();
			// Android fails to display the keyboard at times, which can cause the
			// above `waitForKeyboardToBeHidden` to finish prematurely.
			await editorPage.driver.pause( 1000 );

			// Visual test check for nested content
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleDarkMode( editorPage.driver, false );
		} );

		it( 'sliders display proportionate fill level previews', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.columns );
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );
			await editorPage.dismissBottomSheet();
			await editorPage.openBlockSettings();
			// Wait for the modal to open
			await editorPage.driver.pause( 3000 );

			const cellId = '~Column 1. Width is 50 Percent (%).';
			const cell = await editorPage.driver.$( cellId );
			const cellSize = await cell.getSize();
			const cellLocation = await cell.getLocation();
			const scrollOffset = isAndroid() ? 350 : 100;
			const windowSize = await editorPage.driver.getWindowSize();

			// Reveal default column width cells
			await swipeFromTo(
				editorPage.driver,
				{
					x: cellLocation.x + cellSize.width / 2,
					y: cellLocation.y + cellSize.height / 2,
				},
				{
					x: cellLocation.x + cellSize.width / 2,
					y: windowSize.height / 2,
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

			// Wait for the scrollbars to hide
			await editorPage.driver.pause( 3000 );

			// Visual test check for adjusted columns
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'allows deep nesting to at least 3 levels', async () => {
			await editorPage.initializeEditor( {
				initialData: NESTED_COLUMNS_3_LEVELS,
			} );

			// Wait for the block to be rendered
			await editorPage.driver.pause( 3000 );

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		} );
	} );

	describe( 'Social Icons block', () => {
		it( 'should display active icon colors', async () => {
			await editorPage.initializeEditor();

			await editorPage.addNewBlock( blockNames.socialIcons );
			const twitterIconXpath = isAndroid()
				? '//android.widget.Button[@content-desc="Twitter social icon"]'
				: '//XCUIElementTypeButton[@name="Twitter social icon"]';
			await clickIfClickable( editorPage.driver, twitterIconXpath );
			await editorPage.toggleFormatting( 'Add link to Twitter' );
			const uRLFieldXpath = isAndroid()
				? '//android.widget.Button[@content-desc="URL. Empty"]/android.view.ViewGroup[1]/android.widget.EditText'
				: '//XCUIElementTypeOther[@name="Add URL"]/XCUIElementTypeTextField';
			const uRLField = await waitForVisible(
				editorPage.driver,
				uRLFieldXpath
			);
			await typeString(
				editorPage.driver,
				uRLField,
				'https://twitter.com/WordPress'
			);
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );
			const socialLinksBlockXpath = isAndroid()
				? '//android.widget.Button[@content-desc="Social Icons Block. Row 1"]'
				: '(//XCUIElementTypeOther[@name="Social Icons Block. Row 1"])[1]';
			const socialLinksBlock = await editorPage.driver.$(
				socialLinksBlockXpath
			);

			const screenshot = await takeScreenshotByElement(
				socialLinksBlock,
				{ padding: 7 }
			);
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'should display the block outline of a block inserted from the appender', async () => {
			await editorPage.initializeEditor();

			await editorPage.addNewBlock( blockNames.socialIcons );

			const appenderButton = isAndroid()
				? await editorPage.waitForElementToBeDisplayedByXPath(
						`//android.widget.Button[@resource-id="appender-button"]`
				  )
				: await editorPage.waitForElementToBeDisplayedById(
						'appender-button'
				  );
			await appenderButton.click();

			const amazonBlockXPath = isAndroid()
				? '//android.widget.Button[@content-desc="Amazon block"]'
				: '//XCUIElementTypeButton[@name="Amazon block"]';

			await clickIfClickable( editorPage.driver, amazonBlockXPath );

			const uRLFieldXpath = isAndroid()
				? '//android.widget.Button[@content-desc="URL. Empty"]/android.view.ViewGroup[1]/android.widget.EditText'
				: '//XCUIElementTypeOther[@name="Add URL"]/XCUIElementTypeTextField';
			const uRLField = await waitForVisible(
				editorPage.driver,
				uRLFieldXpath
			);
			await typeString(
				editorPage.driver,
				uRLField,
				'https://amazon.com'
			);
			await editorPage.dismissBottomSheet();
			// Wait for the modal to close
			await editorPage.driver.pause( 3000 );

			const socialLinksBlockXpath = isAndroid()
				? '//android.widget.Button[@content-desc="Social Icons Block. Row 1"]'
				: '(//XCUIElementTypeOther[@name="Social Icons Block. Row 1"])[1]';
			const socialLinksBlock = await editorPage.driver.$(
				socialLinksBlockXpath
			);

			const screenshot = await takeScreenshotByElement(
				socialLinksBlock,
				{ padding: 7 }
			);
			expect( screenshot ).toMatchImageSnapshot();
		} );
	} );
} );
