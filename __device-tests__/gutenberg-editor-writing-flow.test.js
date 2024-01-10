/**
 * Internal dependencies
 */
const { selectTextFromElement, tapSelectAllAboveElement } = e2eUtils;
import { takeScreenshot } from './utils';
const { blockNames } = editorPage;

describe( 'Gutenberg Editor - Writing Flow', () => {
	describe( 'TC007 - Test format detection under the cursor', () => {
		it( 'checks that the proper format buttons are selected when the cursor is under', async () => {
			const paragraphText = [ 'Bold', 'Bold-Italic', 'Strikethrough' ];

			// On a rich-text based component, add bold, italic, strikethrough and link formatted text
			await editorPage.addNewBlock( blockNames.paragraph );
			const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.paragraph
			);

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 0 ]
			);
			await selectTextFromElement(
				editorPage.driver,
				paragraphBlockElement
			);

			// Toggle various formatting options, then proceed with typing more text
			await editorPage.toggleFormatting( 'Bold' );

			const boldScreenshot = await takeScreenshot();
			expect( boldScreenshot ).toMatchImageSnapshot();

			await editorPage.typeTextToTextBlock( paragraphBlockElement, '' );
			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 1 ]
			);
			await selectTextFromElement(
				editorPage.driver,
				paragraphBlockElement
			);

			await editorPage.toggleFormatting( 'Italic' );

			const boldItalicScreenshot = await takeScreenshot();
			expect( boldItalicScreenshot ).toMatchImageSnapshot();

			await editorPage.toggleFormatting( 'Italic' );
			await editorPage.toggleFormatting( 'Bold' );

			await editorPage.typeTextToTextBlock( paragraphBlockElement, '' );
			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 2 ]
			);
			await selectTextFromElement(
				editorPage.driver,
				paragraphBlockElement
			);

			await editorPage.toggleFormatting( 'Strikethrough' );

			const strikethroughScreenshot = await takeScreenshot();
			expect( strikethroughScreenshot ).toMatchImageSnapshot();

			await editorPage.removeBlock();
		} );
	} );

	describe( `TC009 - Test autocorrection doesn't apply formatting to Heading`, () => {
		it( 'checks that formatting is not applied to autocorrected text', async () => {
			const headingText = `Mispelled`;

			// Add a Heading block without any formatting applied.
			await editorPage.addNewBlock( blockNames.heading );
			const headingBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.heading
			);

			// Type a sentence with a word misspelled that will be autocorrected by the editor
			await editorPage.typeTextToTextBlock(
				headingBlockElement,
				headingText
			);

			// Highlight the word that was autocorrected
			await tapSelectAllAboveElement(
				editorPage.driver,
				headingBlockElement
			);

			// Check that the word has no formatting applied
			const selectedText = await editorPage.getTextForParagraphBlockAtPosition(
				1
			);

			expect( selectedText ).toMatch( headingText );

			await editorPage.removeBlock();
		} );
	} );

	describe( `TC010 - Test autocorrection doesn't remove formatting from Heading`, () => {
		it( 'checks that formatting is not removed from autocorrected text', async () => {
			const headingText = 'Mispelled';

			// Add a Heading block
			await editorPage.addNewBlock( blockNames.heading );
			const headingBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.heading
			);

			// Toggle bold formatting
			// Type a sentence with a word misspelled that will be autocorrected by the editor

			await editorPage.toggleFormatting( 'Bold' );
			await editorPage.typeTextToTextBlock(
				headingBlockElement,
				headingText
			);

			// Highlight the word that was autocorrected
			await tapSelectAllAboveElement(
				editorPage.driver,
				headingBlockElement
			);

			// Check that the word has formatting applied
			const selectedText = await editorPage.getTextForParagraphBlockAtPosition(
				1
			);
			expect( selectedText ).toMatch( headingText );

			// TODO: Add assertion or visual snapshot that bold formatting is retained

			await editorPage.removeBlock();
		} );
	} );
} );
