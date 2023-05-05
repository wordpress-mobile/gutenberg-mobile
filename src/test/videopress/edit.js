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
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';

const onlyOnAndroid = Platform.select( { android: it, ios: it.skip } );

const defaultProps = {
	capabilities: {
		videoPressBlock: true,
	},
};

setupCoreBlocks();

beforeAll( () => {
	// Register Jetpack blocks
	setupJetpackEditor( { blogId: 1, isJetpackActive: true } );
	registerJetpackBlocks( defaultProps );
} );

describe( 'VideoPress block', () => {
	onlyOnAndroid(
		'should successfully insert the VideoPress block into the editor',
		async () => {
			const screen = await initializeEditor();

			// Add block
			await addBlock( screen, 'VideoPress' );

			// Get block
			const videoPressBlock = await getBlock( screen, 'VideoPress' );
			expect( videoPressBlock ).toBeVisible();

			const expectedHtml = `<!-- wp:videopress/video /-->`;
			expect( getEditorHtml() ).toBe( expectedHtml );
		}
	);
} );
