/**
 * Internal dependencies
 */
import EditorPage from '../gutenberg/packages/react-native-editor/__device-tests__/pages/editor-page';
import {
	clickBeginningOfElement,
	isAndroid,
	isLocalEnvironment,
	setupDriver,
	stopDriver,
	swipeUp,
} from '../gutenberg/packages/react-native-editor/__device-tests__/helpers/utils';
import wd from 'wd';

jest.setTimeout( 1000000 );

// Disabling eslint here because these tests need to be disabled until Contact Info block is ungated from __DEV__.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip( 'Gutenberg Editor Contact Info Block tests', () => {
	let driver;
	let editorPage;
	let allPassed = true;
	const contactInfoBlockName = 'Contact Info';

	// Use reporter for setting status for saucelabs Job
	if ( ! isLocalEnvironment() ) {
		const reporter = {
			specDone: async ( result ) => {
				allPassed = allPassed && result.status !== 'failed';
			},
		};

		// eslint-disable-next-line jest/no-jasmine-globals
		jasmine.getEnv().addReporter( reporter );
	}

	async function toggleSettings( drv, ePage, bk ) {
		const buttonElementName = isAndroid()
			? '//*'
			: '//XCUIElementTypeButton';
		const blockActionsMenuButtonLocator = `${ buttonElementName }[contains(@${ ePage.accessibilityIdXPathAttrib }, "Open Settings")]`;

		if ( isAndroid() ) {
			let checkList = await drv.elementsByXPath(
				blockActionsMenuButtonLocator
			);
			while ( checkList.length === 0 ) {
				await swipeUp( drv, bk ); // Swipe up to show remove icon at the bottom
				checkList = await drv.elementsByXPath(
					blockActionsMenuButtonLocator
				);
			}
		}

		const blockActionsMenuButton = await drv.elementByXPath(
			blockActionsMenuButtonLocator
		);
		await blockActionsMenuButton.click();
	}

	async function findElement( drv, ePage, name, iosType ) {
		const elementName = isAndroid()
			? '//*'
			: `//XCUIElementType${ iosType }`;
		const blockLocator = `${ elementName }[contains(@${ ePage.accessibilityIdXPathAttrib }, "${ name }")]`;
		const elements = await drv.elementsByXPath( blockLocator );
		return elements[ 0 ];
	}

	async function dismissActionSheet() {
		const action = await new wd.TouchAction( driver );
		action.press( { x: 100, y: 100 } );
		action.release();
		await action.perform();
	}

	beforeAll( async () => {
		driver = await setupDriver();
		editorPage = new EditorPage( driver );
	} );

	beforeEach( async () => {
		await editorPage.addNewBlock( contactInfoBlockName );
	} );

	it( 'should be able to see visual editor', async () => {
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	it( 'should be able to add contact info block', async () => {
		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);

		expect( contactInfoBlock ).toBeTruthy();
	} );

	it( 'should show keyboard when selecting email', async () => {
		const emailBlock = await editorPage.getBlockAtPosition(
			'Email Address'
		);
		emailBlock.click();

		const keyboardShown = await driver.isKeyboardShown();
		expect( keyboardShown ).toEqual( true );

		await editorPage.dismissKeyboard();

		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);
		await clickBeginningOfElement( driver, contactInfoBlock );
	} );

	it( 'should show keyboard when selecting phone', async () => {
		const phoneBlock = await editorPage.getBlockAtPosition(
			'Phone Number',
			2
		);
		phoneBlock.click();

		const keyboardShown = await driver.isKeyboardShown();
		expect( keyboardShown ).toEqual( true );

		await editorPage.dismissKeyboard();

		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);
		await clickBeginningOfElement( driver, contactInfoBlock );
	} );

	it( 'should show keyboard when selecting address', async () => {
		const addressBlock = await editorPage.getBlockAtPosition(
			'Address',
			3
		);
		addressBlock.click();

		const keyboardShown = await driver.isKeyboardShown();
		expect( keyboardShown ).toEqual( true );

		await editorPage.dismissKeyboard();

		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);
		await clickBeginningOfElement( driver, contactInfoBlock );
	} );

	it( 'should have settings toggle on address block', async () => {
		const addressBlock = await editorPage.getBlockAtPosition(
			'Address',
			3
		);
		addressBlock.click();

		await toggleSettings( driver, editorPage, addressBlock );

		const addressSettingsLabel = findElement(
			driver,
			editorPage,
			'Address Settings',
			'Label'
		);
		expect( addressSettingsLabel ).toBeTruthy();

		const addressSettingsLinkToggle = findElement(
			driver,
			editorPage,
			'Link address to Google Maps',
			'Toggle'
		);
		expect( addressSettingsLinkToggle ).toBeTruthy();

		await dismissActionSheet();
		await editorPage.dismissKeyboard();
		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);
		await clickBeginningOfElement( driver, contactInfoBlock );
	} );

	it( 'should only have phone, address, email, separator, heading and spacer options as child blocks', async () => {
		const unavailableBlocks = [
			'Paragraph',
			'More',
			'Image',
			'Video',
			'Page Break',
			'List',
			'Quote',
			'Media & Text',
			'Preformatted',
			'Gallery',
			'Columns',
			'Group',
			'Shortcode',
			'Buttons',
			'Latest Posts',
			'Verse',
			'Cover',
			'Social Icons',
			'Pullquote',
		];
		const availableBlocks = [
			'Address',
			'Email Address',
			'Phone Number',
			'Heading',
			'Separator',
			'Spacer',
		];

		const emailBlock = await editorPage.getBlockAtPosition(
			'Email Address'
		);
		emailBlock.click();

		const addBlockIdentifier = isAndroid()
			? 'Add block, Double tap to add a block'
			: 'Add block';
		const addButton = await driver.elementByAccessibilityId(
			addBlockIdentifier
		);
		await addButton.click();

		// Disabling eslint for next line because there seems to be a bug where variable in for...of block isn't seen.
		// eslint-disable-next-line no-unused-vars
		for ( const blockName of [
			...unavailableBlocks,
			...availableBlocks,
		] ) {
			const block = await driver.hasElementByAccessibilityId( blockName );
			expect( block ).toBe( availableBlocks.includes( blockName ) );
		}

		await dismissActionSheet();
		await editorPage.dismissKeyboard();
		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlockName
		);
		await clickBeginningOfElement( driver, contactInfoBlock );
	} );

	afterEach( async () => {
		await editorPage.removeBlockAtPosition( contactInfoBlockName );
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
