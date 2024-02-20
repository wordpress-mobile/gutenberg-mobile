/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { toggleDarkMode } = e2eUtils;
import { takeScreenshotByElement } from './utils';

const mediaTextBlock = `<!-- wp:media-text -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->`;

describe( 'Gutenberg Editor Visual test for Media & Text Block', () => {
	it( 'should display correct colors for dark mode', async () => {
		await toggleDarkMode( editorPage.driver, true );
		await editorPage.initializeEditor( {
			initialData: mediaTextBlock,
		} );

		const tapOutsideMediaButton = {
			offset: {
				x: ( width ) => Math.floor( width * -0.5 + 20 ),
				y: ( height ) => Math.floor( height * -0.5 + 20 ),
			},
		};
		await editorPage.selectBlockByType(
			blockNames.mediaText,
			tapOutsideMediaButton
		);

		const block = await editorPage.getBlockAtPosition(
			blockNames.mediaText
		);
		const screenshot = await takeScreenshotByElement( block, {
			padding: 7,
		} );
		await toggleDarkMode( editorPage.driver, false );
		expect( screenshot ).toMatchImageSnapshot();
	} );
} );
