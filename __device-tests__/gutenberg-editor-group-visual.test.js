/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';

describe( 'Gutenberg Editor Visual test for Group Block', () => {
	it( 'should show the empty placeholder for the unselected state', async () => {
		await editorPage.initializeEditor();
		await editorPage.addNewBlock( blockNames.group );

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		await titleElement.click();

		await editorPage.dismissKeyboard();

		// Visual test check
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
