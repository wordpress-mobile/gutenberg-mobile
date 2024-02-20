/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { toggleDarkMode } = e2eUtils;
import { takeScreenshotByElement } from './utils';

const quoteBlock = `<!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p>Hello, world!</p>
<!-- /wp:paragraph --><cite>A person</cite></blockquote>
<!-- /wp:quote -->`;

describe( 'Gutenberg Editor Visual test for Quote Block', () => {
	it( 'should display correct colors for dark mode', async () => {
		await toggleDarkMode( editorPage.driver, true );
		await editorPage.initializeEditor( {
			initialData: quoteBlock,
		} );

		const block = await editorPage.getBlockAtPosition( blockNames.quote );
		const screenshot = await takeScreenshotByElement( block, {
			padding: 7,
		} );
		await toggleDarkMode( editorPage.driver, false );
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
