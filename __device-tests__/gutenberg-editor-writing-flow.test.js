/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';
import { WEBSITE_HTML } from './test-editor-data';

describe( 'Gutenberg Editor Writing Flow', () => {
	it( 'should format pasted HTML', async () => {
		// Arrange
		await editorPage.initializeEditor();
		await editorPage.addNewBlock( blockNames.paragraph );
		const paragraphBlock = await editorPage.getTextBlockAtPosition(
			blockNames.paragraph,
			1
		);
		const encodedHtmlContent = btoa(
			unescape( encodeURIComponent( WEBSITE_HTML ) )
		);
		await editorPage.driver.setClipboard( encodedHtmlContent, 'Plaintext' );

		// Act
		await editorPage.pasteClipboardToTextBlock( paragraphBlock );
		await editorPage.driver.pause( 2000 );
		await editorPage.dismissKeyboard();
		await editorPage.getTitleElement( {
			autoscroll: true,
		} );

		// Assert
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
		const html = await editorPage.getHtmlContent();
		expect( html ).toMatchSnapshot();
	} );
} );
