/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	addBlock,
	getBlock,
	setupCoreBlocks,
} from 'test/helpers';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';

setupCoreBlocks();

beforeAll( () => {
	// Register Jetpack blocks
	setupJetpackEditor( {
		blogId: 1,
		isJetpackActive: true,
	} );
	registerJetpackBlocks( {
		capabilities: {
			contactInfoBlock: true,
		},
	} );
} );

describe( 'Contact Info block', () => {
	it( 'should successfully insert the block into the editor', async () => {
		const screen = await initializeEditor();

		// Add block
		await addBlock( screen, 'Contact Info' );

		// Get block
		const block = await getBlock( screen, 'Contact Info' );
		expect( block ).toBeVisible();

		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
