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
} from './helpers/utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

describe( 'Gutenberg Editor tests for List block (end)', () => {
	let driver;
	let editorPage;
	let allPassed = true;
	const listBlockName = 'List';

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

	it( 'should handle separating and merging list items with spaces', async () => {
		await editorPage.addNewBlock( listBlockName );
		const listBlockElement = await editorPage.getBlockAtPosition( listBlockName );

		// Click List block on Android to force EditText focus
		if ( isAndroid() ) {
			await listBlockElement.click();
		}

		// Send the first list item text
		await editorPage.sendTextToListBlock( listBlockElement, '   ' );

		// send an Enter
		await editorPage.sendTextToListBlock( listBlockElement, '\n' );

		// send a delete
		await editorPage.sendTextToListBlock( listBlockElement, '\u0008' );

		const expected = `<!-- wp:list -->
<ul><li>   </li></ul>
<!-- /wp:list -->`;

		await editorPage.verifyHtmlContent( expected );
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
