/**
 * Internal dependencies
 */
const { isAndroid, toggleDarkMode } = e2eUtils;
import { takeScreenshot } from './utils';

describe( 'Gutenberg Editor Visual test for Unsupported Block', () => {
	it( 'should show the empty placeholder for the selected/unselected state', async () => {
		await editorPage.initializeEditor( {
			initialData: e2eTestData.unsupportedBlockHtml,
		} );

		const unsupportedBlock = await editorPage.getBlockAtPosition(
			editorPage.blockNames.unsupported
		);
		await unsupportedBlock.click();
		// Wait for the block to be selected
		await editorPage.driver.sleep( 500 );

		// Visual test check
		let screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		await titleElement.click();

		await editorPage.dismissKeyboard();

		// Visual test check
		screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();
	} );

	it( 'should show the empty placeholder for the selected/unselected state in dark mode', async () => {
		await toggleDarkMode( editorPage.driver, true );

		await editorPage.initializeEditor( {
			initialData: e2eTestData.unsupportedBlockHtml,
		} );

		const unsupportedBlock = await editorPage.getBlockAtPosition(
			editorPage.blockNames.unsupported
		);
		await unsupportedBlock.click();

		// Visual test check
		let screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Select title to unfocus the block
		const titleElement = await editorPage.getTitleElement();
		await titleElement.click();

		await editorPage.dismissKeyboard();

		// Visual test check
		screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		await toggleDarkMode( editorPage.driver, false );
	} );

	it( 'should be able to open the unsupported block web view editor', async () => {
		await editorPage.initializeEditor( {
			initialData: e2eTestData.unsupportedBlockHtml,
		} );

		const unsupportedBlock = await editorPage.getBlockAtPosition(
			editorPage.blockNames.unsupported
		);
		await unsupportedBlock.click();

		const helpButton = await editorPage.getUnsupportedBlockHelpButton();
		await helpButton.click();

		// Wait for the modal to show
		await editorPage.driver.sleep( 3000 );

		// Visual test check
		const screenshot = await takeScreenshot();
		expect( screenshot ).toMatchImageSnapshot();

		// Disabled for now on Android see https://github.com/wordpress-mobile/gutenberg-mobile/issues/5321
		if ( ! isAndroid() ) {
			const editButton = await editorPage.getUnsupportedBlockBottomSheetEditButton();
			await editButton.click();

			const webView = await editorPage.getUnsupportedBlockWebView();
			await expect( webView ).toBeTruthy();
		}
	} );
} );
