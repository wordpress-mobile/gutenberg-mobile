/**
 * @format
 * */

/**
 * Internal dependencies
 */
import EditorPage from './pages/editor-page';
import {
	setupDriver,
	isLocalEnvironment,
	stopDriver,
	isAndroid,
	clickMiddleOfElement,
	swipeUp,
} from './helpers/utils';
import testData from './helpers/test-data';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 400000;

describe( 'Gutenberg Editor Image Block tests', () => {
	let driver;
	let editorPage;
	let allPassed = true;

	// Use reporter for setting status for saucelabs Job
	if ( ! isLocalEnvironment() ) {
		const reporter = {
			specDone: async ( result ) => {
				allPassed = allPassed && result.status !== 'failed';
			},
		};

		jasmine.getEnv().addReporter( reporter );
	}

	beforeAll( async () => {
		driver = await setupDriver();
		editorPage = new EditorPage( driver );
	} );

	afterEach( async () => {
		//await this.removeAllBlocks();
		let blockExist = await editorPage.hasBlockAtPosition( 1 );
		while ( blockExist ) {
			if ( await editorPage.hasBlockAtPosition( 2 ) ) {
				if ( isAndroid() ) {
					const blockElement = await editorPage.getBlockAtPosition( 1, '' );
					await blockElement.click();
					await editorPage.removeBlockAtPosition( 1 );
				} else {
					const blockElement = await editorPage.getBlockAtPosition( 2, '' );
					await blockElement.click();
					await swipeUp( driver, blockElement );
					await editorPage.removeBlockAtPosition( 2 );
				}
				blockExist = true;
			} else {
				await editorPage.removeBlockAtPosition( 1 );
				return;
			}
		}
	} );

	it( 'should be able to see visual editor', async () => {
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	it( 'should be able to add an image block', async () => {
		await editorPage.addNewImageBlock();
		let imageBlock = await editorPage.getImageBlockAtPosition( 1 );

		// Can only add image from media library on iOS
		if ( ! isAndroid() ) {
			await editorPage.selectEmptyImageBlock( imageBlock );
			await editorPage.chooseMediaLibrary();

			// Workaround because of #952
			const titleElement = await editorPage.getTitleElement();
			await clickMiddleOfElement( driver, titleElement );
			await editorPage.dismissKeyboard();
			// end workaround

			imageBlock = await editorPage.getImageBlockAtPosition( 1 );
			await imageBlock.click();
			await swipeUp( driver, imageBlock );
			await editorPage.enterCaptionToSelectedImageBlock( testData.imageCaption );
			await editorPage.dismissKeyboard();
			imageBlock = await editorPage.getImageBlockAtPosition( 1 );
			await imageBlock.click();
		}
	} );

	it( 'should be able to add an image block with multiple paragraph blocks', async () => {
		await editorPage.addNewImageBlock();
		let imageBlock = await editorPage.getImageBlockAtPosition( 1 );

		// Can only add image from media library on iOS
		if ( ! isAndroid() ) {
			await editorPage.selectEmptyImageBlock( imageBlock );
			await editorPage.chooseMediaLibrary();

			imageBlock = await editorPage.getImageBlockAtPosition( 1 );
			await imageBlock.click();
			await swipeUp( driver, imageBlock );
			await editorPage.enterCaptionToSelectedImageBlock( testData.imageCaption );
			await editorPage.dismissKeyboard();
		}

		await editorPage.addNewParagraphBlock();
		const paragraphBlockElement = await editorPage.getParagraphBlockAtPosition( 2 );
		if ( isAndroid() ) {
			await paragraphBlockElement.click();
		}
		await editorPage.sendTextToParagraphBlockAtPosition( 2, testData.longText );

		// skip HTML check for Android since we couldn't add image from media library
		if ( ! isAndroid() ) {
			await editorPage.verifyHtmlContent( testData.imageCompletehtml );
		}
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
