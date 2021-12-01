/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	fireEvent,
	waitFor,
	within,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';

const defaultProps = {
	capabilities: {
		tiledGalleryBlock: true,
	},
};

beforeAll( () => {
	// Register all core blocks
	registerCoreBlocks();
	// Register Jetpack blocks
	setupJetpackEditor( { blogId: 1, isJetpackActive: true } );
	registerJetpackBlocks( defaultProps );
} );

afterAll( () => {
	// Clean up registered blocks
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Tiled Gallery block', () => {
	it.skip( 'inserts the block', async () => {
		const {
			getByA11yLabel,
			getByTestId,
			getByText,
			debug,
		} = await initializeEditor( {
			initialHtml: '',
			capabilities: { tiledGalleryBlock: true },
		} );

		// Open the inserter menu
		fireEvent.press( await waitFor( () => getByA11yLabel( 'Add block' ) ) );

		const blockList = getByTestId( 'InserterUI-Blocks' );
		// onScroll event used to force the FlatList to render all items
		fireEvent.scroll( blockList, {
			nativeEvent: {
				contentOffset: { y: 0, x: 0 },
				contentSize: { width: 100, height: 100 },
				layoutMeasurement: { width: 100, height: 100 },
			},
		} );

		// Insert the block
		fireEvent.press( await waitFor( () => getByText( 'Tiled Gallery' ) ) );

		// Get the block
		const block = await waitFor( () =>
			getByA11yLabel( /Tiled Gallery Block\. Row 1/ )
		);

		expect( block ).toBeDefined();
		const expectedHtml = `<!-- wp:jetpack/tiled-gallery /-->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );

	it( 'deserializes web HTML for square layout successfully', async () => {
		const initialHtml = `
		<!-- wp:jetpack/tiled-gallery {"className":"is-style-square","columnWidths":[["20.52544","40.80006","20.44918","18.22532"]],"ids":[11,12,13,10]} -->
<div class="wp-block-jetpack-tiled-gallery aligncenter is-style-square"><div class="tiled-gallery__gallery"><div class="tiled-gallery__row columns-1"><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2129" data-id="11" data-link="https://sandbox1359387942.wpcomstaging.com/placeholder-image-2/" data-url="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-432222-jpeg-e1563987029380.jpg" data-width="1600" src="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-432222-jpeg-e1563987029380.jpg" data-amp-layout="responsive"/></figure></div></div><div class="tiled-gallery__row columns-3"><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="1067" data-id="12" data-link="https://sandbox1359387942.wpcomstaging.com/placeholder-image-3/" data-url="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-593223-jpeg.jpg" data-width="1600" src="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-593223-jpeg.jpg" data-amp-layout="responsive"/></figure></div><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2137" data-id="13" data-link="https://sandbox1359387942.wpcomstaging.com/placeholder-image-4/" data-url="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-593179-jpeg-e1564077551741.jpg" data-width="1600" src="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-593179-jpeg-e1564077551741.jpg" data-amp-layout="responsive"/></figure></div><div class="tiled-gallery__col"><figure class="tiled-gallery__item"><img alt="" data-height="2400" data-id="10" data-link="https://sandbox1359387942.wpcomstaging.com/placeholder-image/" data-url="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-432666-jpeg.jpg" data-width="1600" src="https://sandbox1359387942.wpcomstaging.com/wp-content/uploads/2020/10/image-from-rawpixel-id-432666-jpeg.jpg" data-amp-layout="responsive"/></figure></div></div></div></div>
<!-- /wp:jetpack/tiled-gallery -->`;
		const screen = await initializeEditor( { initialHtml } );
		// We must await the image fetch via `getMedia`
		await act( () => apiFetchPromise );

		const imageBlock = screen.getByA11yLabel( /Tiled Gallery Block/ );
		fireEvent.press( imageBlock );

		const settingsButton = screen.getByA11yLabel( 'Open Settings' );
		await act( () => fireEvent.press( settingsButton ) );

		const columnsText = screen.getByText( 'Columns' );

		expect( columnsText ).toBeDefined();
	} );
} );
