/**
 * Internal dependencies
 */
import EditorPage from '../gutenberg/packages/react-native-editor/__device-tests__/pages/editor-page';
import {
	setupDriver,
	isLocalEnvironment,
	stopDriver,
	isAndroid,
	swipeUp,
} from '../gutenberg/packages/react-native-editor/__device-tests__/helpers/utils';
import wd from 'wd';

jest.setTimeout( 1000000 );

describe( 'Gutenberg Editor Contact Info Block tests', () => {
	let driver;
	let editorPage;
	let allPassed = true;
	const paragraphBlockName = 'Paragraph';
	const headerBlockName = 'Heading';

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

	async function findElement( drv, ePage, name, iosType ) {
		const elementName = isAndroid()
			? '//*'
			: `//XCUIElementType${ iosType }`;
		const blockLocator = `${ elementName }[contains(@${ ePage.accessibilityIdXPathAttrib }, "${ name }")]`;
		const elements = await drv.elementsByXPath( blockLocator );
		return elements[ 0 ];
	}

	async function toggleMover( drv, ePage, bk, moveUp ) {
		const moveBlockDirection = `Move block ${ moveUp ? 'up' : 'down' }`;
		const buttonElementName = isAndroid()
			? '//*'
			: '//XCUIElementTypeButton';
		const blockActionsMenuButtonLocator = `${ buttonElementName }[contains(@${ ePage.accessibilityIdXPathAttrib }, ${ moveBlockDirection })]`;

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

		const action = new wd.TouchAction();
		action.longPress( { el: blockActionsMenuButton } );
		await action.perform();
	}

	beforeAll( async () => {
		driver = await setupDriver();
		editorPage = new EditorPage( driver );
	} );

	it( 'should be able to see visual editor', async () => {
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	it( 'should be able to see move block to top when long pressing up', async () => {
		await editorPage.addNewBlock( paragraphBlockName );
		await editorPage.addNewBlock( headerBlockName );

		const headerBlock = await editorPage.getBlockAtPosition(
			headerBlockName
		);
		headerBlock.click();

		await toggleMover( driver, editorPage, headerBlock, true );

		const moveUpAction = await findElement(
			driver,
			editorPage,
			'Move to top',
			'Button'
		);

		expect( moveUpAction ).toBeTruthy();

		const cancelAction = await findElement(
			driver,
			editorPage,
			'Cancel',
			'Button'
		);
		cancelAction.click();

		await editorPage.removeBlockAtPosition( paragraphBlockName );
		await editorPage.removeBlockAtPosition( headerBlockName );
	} );

	it( 'should be able to move block to first block when pressing move block to top', async () => {
		await editorPage.addNewBlock( paragraphBlockName );
		await editorPage.addNewBlock( headerBlockName );

		const headerBlock = await editorPage.getBlockAtPosition(
			headerBlockName
		);
		headerBlock.click();

		await toggleMover( driver, editorPage, headerBlock, true );

		const moveUpAction = await findElement(
			driver,
			editorPage,
			'Move to top',
			'Button'
		);
		moveUpAction.click();

		const headerIsFirst = editorPage.hasBlockAtPosition(
			1,
			headerBlockName
		);
		expect( headerIsFirst ).toBe( true );

		await editorPage.removeBlockAtPosition( paragraphBlockName );
		await editorPage.removeBlockAtPosition( headerBlockName );
	} );

	it( 'should be able to see move block to bottom when long pressing down', async () => {
		await editorPage.addNewBlock( paragraphBlockName );
		await editorPage.addNewBlock( headerBlockName );

		const paragraphBlock = await editorPage.getBlockAtPosition(
			paragraphBlockName
		);
		paragraphBlock.click();

		await toggleMover( driver, editorPage, paragraphBlock, false );

		const moveDownAction = await findElement(
			driver,
			editorPage,
			'Move to bottom',
			'Button'
		);

		expect( moveDownAction ).toBeTruthy();

		const cancelAction = await findElement(
			driver,
			editorPage,
			'Cancel',
			'Button'
		);
		cancelAction.click();

		await editorPage.removeBlockAtPosition( paragraphBlockName );
		await editorPage.removeBlockAtPosition( headerBlockName );
	} );

	it( 'should be able to move block to last block when pressing move block to bottom', async () => {
		await editorPage.addNewBlock( paragraphBlockName );
		await editorPage.addNewBlock( headerBlockName );

		const paragraphBlock = await editorPage.getBlockAtPosition(
			paragraphBlockName
		);
		paragraphBlock.click();

		await toggleMover( driver, editorPage, paragraphBlock, false );

		const moveDownAction = await findElement(
			driver,
			editorPage,
			'Move to bottom',
			'Button'
		);
		moveDownAction.click();

		const headerIsFirst = await editorPage.hasBlockAtPosition(
			1,
			headerBlockName
		);
		expect( headerIsFirst ).toBe( true );

		await editorPage.removeBlockAtPosition( paragraphBlockName );
		await editorPage.removeBlockAtPosition( headerBlockName );
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
