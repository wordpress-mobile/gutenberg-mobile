/**
 * External dependencies
 */
import { screen, initializeEditor, setupCoreBlocks } from 'test/helpers';

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
	registerJetpackBlocks( { capabilities: {} } );
} );

describe( 'Paywall block', () => {
	it( 'should render the expected label text', async () => {
		await initializeEditor( {
			initialHtml: '<!-- wp:jetpack/paywall /-->',
		} );

		expect(
			screen.getByText( 'Subscriber-only content below HACKED TO EXPERIENCE FAILURE IN CI' )
		).toBeVisible();
	} );
} );
