/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const {
	toggleOrientation,
	selectTextFromElement,
	toggleDarkMode,
	isAndroid,
	waitForVisible,
} = e2eUtils;
import { takeScreenshot, takeScreenshotByElement } from './utils';

const GROUP_NESTED_STRUCTURE_LEVELS = 3;

describe( 'Gutenberg Editor - Test Suite 4', () => {
	describe( 'Spacer block', () => {
		it( 'should render proper alignment and spacing in landscape orientation', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.spacer );

			await toggleOrientation( editorPage.driver );

			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );

			// Visual test check for selected state
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			const titleElement = await editorPage.getTitleElement( {
				autoscroll: true,
			} );
			await titleElement.click();

			await editorPage.dismissKeyboard();

			// Visual test check for unselected state
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await toggleOrientation( editorPage.driver );

			// Wait for the device to finish rotating
			await editorPage.driver.pause( 3000 );
		} );

		it( 'should render dark mode colors', async () => {
			// Toggling dark mode
			await toggleDarkMode( editorPage.driver, true );

			await editorPage.initializeEditor();

			// Add Spacer block
			await editorPage.addNewBlock( blockNames.spacer );

			// Open and wait for block settings
			await editorPage.openBlockSettings();
			await editorPage.driver.pause( 500 );

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Clean up test
			await toggleDarkMode( editorPage.driver, false );
		} );
	} );

	describe( 'Buttons block', () => {
		const buttonCustomColors = `<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#b1005b","text":"#ffe6f2"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background wp-element-button" style="color:#ffe6f2;background-color:#b1005b">Button</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`;

		it( 'should render custom text and background color', async () => {
			await editorPage.initializeEditor( {
				initialData: buttonCustomColors,
			} );

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			expect( buttonsBlock ).toBeTruthy();

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'should render gradient background color', async () => {
			const testData = `<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"gradient":"luminous-dusk"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-luminous-dusk-gradient-background has-background wp-element-button">Button</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`;

			await editorPage.initializeEditor( {
				initialData: testData,
			} );

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			expect( buttonsBlock ).toBeTruthy();

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'should have its selection / caret with the same color as the font', async () => {
			await editorPage.initializeEditor( {
				initialData: buttonCustomColors,
			} );

			const buttonBlock = await editorPage.getBlockAtPosition(
				blockNames.button
			);

			// Get button's block TextInput
			const buttonBlockTextInput =
				await editorPage.getButtonBlockTextInputAtPosition();
			await buttonBlockTextInput.click();
			await selectTextFromElement(
				editorPage.driver,
				buttonBlockTextInput
			);

			// Wait for text context menu animation
			await editorPage.driver.pause( 500 );

			// Visual test check
			const screenshot = await takeScreenshotByElement( buttonBlock );
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'should allow edit text styles', async () => {
			await editorPage.initializeEditor();
			await editorPage.addNewBlock( blockNames.buttons );

			const firstButtonTextInput =
				await editorPage.getButtonBlockTextInputAtPosition();
			await editorPage.typeTextToTextBlock(
				firstButtonTextInput,
				e2eTestData.listItem2
			);
			await selectTextFromElement(
				editorPage.driver,
				firstButtonTextInput
			);

			// Toggle Bold formatting for the first Button block
			await editorPage.toggleFormatting( 'Bold' );

			// Add a second button block
			await editorPage.addButtonWithInlineAppender( 2 );
			const secondButtonTextInput =
				await editorPage.getButtonBlockTextInputAtPosition( 2 );
			await editorPage.typeTextToTextBlock(
				secondButtonTextInput,
				e2eTestData.listItem2
			);
			await selectTextFromElement(
				editorPage.driver,
				secondButtonTextInput
			);

			// Toggle Italic formatting for the first Button block
			await editorPage.toggleFormatting( 'Italic' );

			// Add a third button block
			await editorPage.addButtonWithInlineAppender( 3 );
			const thirdButtonTextInput =
				await editorPage.getButtonBlockTextInputAtPosition( 3 );
			await editorPage.typeTextToTextBlock(
				thirdButtonTextInput,
				e2eTestData.listItem2
			);
			await selectTextFromElement(
				editorPage.driver,
				thirdButtonTextInput
			);

			// Toggle Strikethrough formatting for the first Button block
			await editorPage.toggleFormatting( 'Strikethrough' );

			// Unfocus the Buttons block
			const titleElement = await editorPage.getTitleElement( {
				autoscroll: true,
			} );
			await titleElement.click();

			await editorPage.dismissKeyboard();
			await editorPage.driver.pause( 500 );

			// Visual test check for unselected state
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		} );

		it( 'should render dark mode colors', async () => {
			// Toggling dark mode
			await toggleDarkMode( editorPage.driver, true );

			await editorPage.initializeEditor();

			// Add Buttons block
			await editorPage.addNewBlock( blockNames.buttons );
			const buttonTextInput =
				await editorPage.getButtonBlockTextInputAtPosition();
			await editorPage.typeTextToTextBlock(
				buttonTextInput,
				e2eTestData.shortButtonText
			);

			// Open and wait for block settings
			await editorPage.openBlockSettings();
			await editorPage.driver.pause( 500 );

			// Visual test check
			let screenshot;
			if ( isAndroid() ) {
				// On Android, we take the screenshot using the block list element
				// in order to crop some pixels using the padding argument.
				const editorScreen =
					await editorPage.waitForElementToBeDisplayedByXPath(
						'//android.widget.FrameLayout[@resource-id="android:id/content"]'
					);
				screenshot = await takeScreenshotByElement( editorScreen, {
					padding: { right: -10 },
				} );
			} else {
				screenshot = await takeScreenshot();
			}
			expect( screenshot ).toMatchImageSnapshot();

			// Clean up test
			await toggleDarkMode( editorPage.driver, false );
		} );
	} );

	describe( 'Group block', () => {
		it( 'should traverse up and down nested blocks', async () => {
			// Add nested structure
			await editorPage.initializeEditor( {
				initialData: e2eTestData.groupNestedStructure,
			} );

			// Tap on one of the bottom-most blocks in hierarchy to check that navigation
			// down works according to deepest-descendent-first approach.
			//
			// The query differs between platforms:
			// - Android: Find a Spacer block matching a button element by index.
			// - iOS: Find a Spacer block by hierarchy, in this case, a block that is nested
			// 	 on an element with the label "Level N".
			const mostBottomSpacerXPath = isAndroid()
				? `(//android.widget.Button[@content-desc="Spacer Block. Row 2"])[${ GROUP_NESTED_STRUCTURE_LEVELS }]`
				: `(//*[contains(@name, "Level ${ GROUP_NESTED_STRUCTURE_LEVELS } ${ blockNames.spacer } Block")])[last()]/*[@name="${ blockNames.spacer } Block. Row 2"]`;
			const mostBottomSpacer = await waitForVisible(
				editorPage.driver,
				mostBottomSpacerXPath
			);
			await mostBottomSpacer.click();

			await editorPage.driver.pause( 500 );

			// Visual test check
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Navigate up
			for ( let i = 1; i <= GROUP_NESTED_STRUCTURE_LEVELS; i++ ) {
				await editorPage.moveBlockSelectionUp();

				await editorPage.driver.pause( 250 );

				// Visual test check
				screenshot = await takeScreenshot();
				expect( screenshot ).toMatchImageSnapshot();
			}
		} );

		it( 'should navigate between nested blocks', async () => {
			// Add nested structure
			await editorPage.initializeEditor( {
				initialData: e2eTestData.groupNestedStructure,
			} );

			const tapOnLevel = async ( level ) => {
				const spacerXPath = isAndroid()
					? `(//android.widget.Button[@content-desc="Spacer Block. Row 2"])[${ level }]`
					: `(//*[contains(@name, "Level ${ level } ${ blockNames.spacer } Block")])[last()]/*[@name="${ blockNames.spacer } Block. Row 2"]`;
				const block = await waitForVisible(
					editorPage.driver,
					spacerXPath
				);
				await block.click();

				await editorPage.driver.pause( 500 );

				// Visual test check
				const screenshot = await takeScreenshot();
				expect( screenshot ).toMatchImageSnapshot();
			};

			// Navigate up by tapping on the paragraph block of each level
			for ( let i = GROUP_NESTED_STRUCTURE_LEVELS; i >= 1; i-- ) {
				await tapOnLevel( i );
			}
		} );

		it( 'should render dark mode colors', async () => {
			// Toggling dark mode
			await toggleDarkMode( editorPage.driver, true );

			await editorPage.initializeEditor();

			// Add Group block
			await editorPage.addNewBlock( blockNames.group );
			const groupBlock = await editorPage.getBlockAtPosition(
				blockNames.group
			);

			// Insert a Paragraph block into Group block
			await editorPage.addBlockUsingAppender(
				groupBlock,
				blockNames.paragraph
			);
			const paragraphBlock = await editorPage.getTextBlockAtPosition(
				blockNames.paragraph
			);
			await editorPage.typeTextToTextBlock(
				paragraphBlock,
				e2eTestData.shortText
			);

			// Select parent Group block
			await editorPage.moveBlockSelectionUp( {
				toRoot: true,
			} );

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Clean up test
			await toggleDarkMode( editorPage.driver, false );
		} );
	} );
} );
