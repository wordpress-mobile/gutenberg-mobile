/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { toggleOrientation, selectTextFromElement } = e2eUtils;
import { takeScreenshot } from './utils';

describe( 'Gutenberg Editor - Test Suite 4', () => {
	it( 'Spacer block - Spacer in horizontal layout works as expected', async () => {
		await editorPage.addNewBlock( blockNames.spacer );

		await toggleOrientation( editorPage.driver );

		// Wait for the device to finish rotating
		await editorPage.driver.sleep( 3000 );

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
		await editorPage.driver.sleep( 3000 );

		const spaceBlock = await editorPage.getBlockAtPosition(
			blockNames.spacer
		);
		await spaceBlock.click();
		await editorPage.removeBlock();
	} );

	describe( 'Buttons block', () => {
		const buttonCustomColors = `<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"style":{"color":{"background":"#b1005b","text":"#ffe6f2"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background wp-element-button" style="color:#ffe6f2;background-color:#b1005b">Button</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`;

		it( 'Render custom text and background color', async () => {
			await editorPage.setHtmlContent( buttonCustomColors );

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			expect( buttonsBlock ).toBeTruthy();

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await buttonsBlock.click();
			await editorPage.removeBlock();
		} );

		it( 'Render gradient background color', async () => {
			const testData = `<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"gradient":"luminous-dusk"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-luminous-dusk-gradient-background has-background wp-element-button">Button</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->`;

			await editorPage.setHtmlContent( testData );

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			expect( buttonsBlock ).toBeTruthy();

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await buttonsBlock.click();
			await editorPage.removeBlock();
		} );

		it( 'Check if selection / caret color matches font color', async () => {
			await editorPage.setHtmlContent( buttonCustomColors );

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			await buttonsBlock.click();

			const buttonBlock = await editorPage.getBlockAtPosition(
				blockNames.button
			);
			await buttonBlock.click();

			// Get button's block TextInput
			const buttonBlockTextInput = await editorPage.getButtonBlockTextInputAtPosition();
			await selectTextFromElement(
				editorPage.driver,
				buttonBlockTextInput
			);

			// Visual test check
			const screenshot = await takeScreenshot( {
				withoutKeyboard: true,
			} );
			expect( screenshot ).toMatchImageSnapshot();

			await buttonBlockTextInput.click();

			await editorPage.removeBlock();
		} );

		it( 'Edit text styles', async () => {
			await editorPage.addNewBlock( blockNames.buttons );

			const firstButtonTextInput = await editorPage.getButtonBlockTextInputAtPosition();
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
			const secondButtonTextInput = await editorPage.getButtonBlockTextInputAtPosition(
				2
			);
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
			const thirdButtonTextInput = await editorPage.getButtonBlockTextInputAtPosition(
				3
			);
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

			// Visual test check for unselected state
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			const buttonsBlock = await editorPage.getBlockAtPosition(
				blockNames.buttons
			);
			buttonsBlock.click();

			// Navigate upwards to select parent block
			await editorPage.moveBlockSelectionUp();

			await editorPage.removeBlock();
		} );
	} );
} );
