/**
 * Internal dependencies
 */
import { blockNames } from '../gutenberg/packages/react-native-editor/__device-tests__/pages/editor-page';
import { isAndroid } from '../gutenberg/packages/react-native-editor/__device-tests__/helpers/utils';

describe( 'Gutenberg Editor tests for Contact Info block', () => {
	// Prevent regression of https://github.com/wordpress-mobile/gutenberg-mobile/issues/3064
	it( 'should render inner blocks', async () => {
		await editorPage.addNewBlock( blockNames.contactInfo );
		let contactInfoBlock = await editorPage.getBlockAtPosition(
			blockNames.contactInfo
		);
		// Click List block on Android to force focus
		if ( isAndroid() ) {
			await contactInfoBlock.click();
		}

		const emailBlock = await editorPage.getBlockAtPosition(
			blockNames.email
		);
		expect( emailBlock ).toBeTruthy();

		const phoneBlock = await editorPage.getBlockAtPosition(
			blockNames.phone,
			2
		);
		expect( phoneBlock ).toBeTruthy();

		const addressBlock = await editorPage.getBlockAtPosition(
			blockNames.address,
			3
		);
		expect( addressBlock ).toBeTruthy();

		// Remove contact info block to reset editor to clean state
		contactInfoBlock = await editorPage.getBlockAtPosition(
			blockNames.contactInfo
		);
		await contactInfoBlock.click();
		await editorPage.removeBlockAtPosition( blockNames.contactInfo );
	} );
} );
