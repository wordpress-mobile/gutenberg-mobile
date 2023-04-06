/**
 * Internal dependencies
 */
import { tapSelectAllAboveElement } from './helpers/utils';
const { blockNames } = editorPage;

describe( 'Gutenberg Editor - Writing Flow', () => {
	describe( 'TC007 - Test format detection under the cursor', () => {
		it( 'checks that the proper format buttons are selected when the cursor is under', async () => {
			const paragraphHTML = `<!-- wp:paragraph -->
            <p><span accessibility-id="bold"><strong>bold</strong></span>
            <span accessibility-id="bold-italic"><strong><i>bold-italic</i></strong>.</span>
            <span accessibility-id-"strikethrough"><s>strikethrough</s></span></p>
            <!-- /wp:paragraph -->`;

			// On a rich-text based component, add bold, italic, strikethrough and link formatted text
			await editorPage.addNewBlock( blockNames.paragraph );
			const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.paragraph
			);

			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				paragraphHTML
			);

			// Select bold text
			// TODO: verify if this is the best method to select text formatting
			await editorPage.elementsByAccessibilityId( 'bold' );

			// Check that the proper format buttons get selected
			// TODO: Identify best method to identify format buttons

			// TODO: Invoke assertion or snapshot here?

			// TODO: Repeat for bold-italic and strikethrough

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
