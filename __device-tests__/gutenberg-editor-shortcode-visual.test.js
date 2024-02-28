/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { toggleDarkMode } = e2eUtils;
import { takeScreenshotByElement } from './utils';

const shortcodeBlock = `<!-- wp:shortcode /-->`;

describe( 'Gutenberg Editor Visual test for Shortcode Block', () => {
	it( 'should display correct colors for dark mode', async () => {
		await toggleDarkMode( editorPage.driver, true );
		await editorPage.initializeEditor( {
			initialData: shortcodeBlock,
		} );

		const block = await editorPage.getBlockAtPosition(
			blockNames.shortcode
		);
		const screenshot = await takeScreenshotByElement( block );
		await toggleDarkMode( editorPage.driver, false );
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
