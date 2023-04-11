/**
 * Internal dependencies
 */
import { tapSelectAllAboveElement } from './helpers/utils';
const { blockNames } = editorPage;

describe( 'Gutenberg Editor - Writing Flow', () => {
	describe( 'TC007 - Test format detection under the cursor', () => {
		it( 'checks that the proper format buttons are selected when the cursor is under', async () => {
			const paragraphText = [
				'Text to type',
				'into the block',
				'to test various',
				'formatting options',
			];

			// On a rich-text based component, add bold, italic, strikethrough and link formatted text
			await editorPage.addNewBlock( blockNames.paragraph );
			const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.paragraph
			);

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 0 ]
			);

			// Toggle various formatting options, then proceed with typing more text
			await editorPage.toggleFormatting( 'Bold' );

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 1 ]
			);

			await editorPage.toggleFormatting( 'Italic' );

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 2 ]
			);

			await editorPage.toggleFormatting( 'Italic' );
			await editorPage.toggleFormatting( 'Bold' );

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphText[ 3 ]
			);

			await editorPage.toggleFormatting( 'Strikethrough' );

			// TODO: Invoke assertion or snapshot here?

			await editorPage.removeBlock();
		} );
	} );

	describe( `TC009 - Test autocorrection doesn't apply formatting to Heading`, () => {
		it( 'checks that formatting is not applied to autocorrected text', async () => {
			const headingText = `<p>Mispelled</p>`;

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
			// TODO: verify if a snapshot should be used in place of an assertion, or both
			expect( selectedText ).toMatch( headingText );

			await editorPage.removeBlock();
		} );
	} );

	describe( `TC010 - Test autocorrection doesn't remove formatting from Heading`, () => {
		it( 'checks that formatting is not removed from autocorrected text', async () => {
			const headingText = '<p><strong>Mispelled</strong></p>';

			// Add a Heading block
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

			// Check that the word has formatting applied
			const selectedText = await editorPage.getTextForParagraphBlockAtPosition(
				1
			);
			// TODO: verify if a snapshot should be used in place of an assertion, or both
			expect( selectedText ).toMatch( headingText );

			await editorPage.removeBlock();
		} );
	} );
} );
