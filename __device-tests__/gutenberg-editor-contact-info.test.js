/**
 * Internal dependencies
 */
import EditorPage from './gutenberg/packages/react-native-editor/__device-tests__/pages/editor-page';
import {
	setupDriver,
	isLocalEnvironment,
	stopDriver,
} from '.gutenberg/packages/react-native-editor/__device-tests__/helpers/utils';

jest.setTimeout( 1000000 );

describe( 'Gutenberg Editor Contact Info Block tests', () => {
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

	beforeAll( async () => {
		driver = await setupDriver();
		editorPage = new EditorPage( driver );
	} );

	it( 'should be able to see visual editor', async () => {
		await expect( editorPage.getBlockList() ).resolves.toBe( true );
	} );

	it( 'should be able to add a contact info block', async () => {
		await editorPage.addNewBlock( contactInfoBlockName );
		const contactInfoBlock = await editorPage.getBlockAtPosition(
			contactInfoBlock
		);

		expect( contactInfoBlock ).toBeTruthy();
		await editorPage.removeBlockAtPosition( contactInfoBlock );
	} );

	afterAll( async () => {
		if ( ! isLocalEnvironment() ) {
			driver.sauceJobStatus( allPassed );
		}
		await stopDriver( driver );
	} );
} );
