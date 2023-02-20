/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot } from './utils';

describe( 'Gutenberg Editor Visual test for Group Block', () => {
	it( 'should show the empty placeholder for the unselected state', async () => {
		await editorPage.addNewBlock( blockNames.group );

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		titleElement.click();

		await editorPage.dismissKeyboard();
		// Wait for the keyboard to be hidden
		await editorPage.driver.sleep( 3000 );

		// Visual test check
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
