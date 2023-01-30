/**
 * WordPress dependencies
 */
import {
	getBlockTypes,
	getBlockVariations,
	unregisterBlockType,
	unregisterBlockVariation,
} from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { registerCoreBlocks } from '@wordpress/block-library';
import { removeAllFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import getJetpackData, {
	JETPACK_DATA_PATH,
} from '../../jetpack/projects/js-packages/shared-extension-utils/src/get-jetpack-data';
import {
	registerJetpackBlocks,
	registerJetpackEmbedVariations,
	setupJetpackEditor,
} from '../jetpack-editor-setup';

const defaultJetpackData = { blogId: 1, isJetpackActive: true };
const defaultProps = {
	capabilities: {
		mediaFilesCollectionBlock: true,
		contactInfoBlock: true,
		facebookEmbed: true,
		instagramEmbed: true,
		loomEmbed: true,
		smartframeEmbed: true,
	},
};
const jetpackBlocks = [
	'jetpack/contact-info',
	'jetpack/story',
	'jetpack/tiled-gallery',
	'jetpack/videopress',
];
const jetpackEmbedVariations = [
	'facebook',
	'instagram',
	'loom',
	'smartframe',
];

/**
 * Registers the Jetpack blocks using a sandbox registry for the modules via `jest.isolateModules`.
 * Module isolation is required in this case because the Jetpack blocks are registered upon module importation.
 *
 * @param {Object} props
 * @return {Object} Blocks API registered in the sandbox registry.
 */
const registerJetpackBlocksIsolated = ( props ) => {
	let blocksAPI;
	jest.isolateModules( () => {
		registerJetpackBlocks( props );
		blocksAPI = require( '@wordpress/blocks' );
	} );
	return blocksAPI;
};

describe( 'Jetpack blocks', () => {
	afterEach( () => {
		// Reset Jetpack data
		delete global.window[ JETPACK_DATA_PATH ];
	} );

	it( 'should set up Jetpack data', () => {
		const expectedJetpackData = {
			available_blocks: {
				'contact-info': { available: true },
				story: { available: true },
				'tiled-gallery': { available: true },
			},
			jetpack: { is_active: true },
			siteFragment: null,
			tracksUserData: null,
			wpcomBlogId: 1,
		};
		setupJetpackEditor( defaultJetpackData );

		expect( getJetpackData() ).toEqual( expectedJetpackData );
	} );

	it( 'should register Jetpack blocks if Jetpack is active', () => {
		setupJetpackEditor( defaultJetpackData );
		const blocksAPI = registerJetpackBlocksIsolated( defaultProps );

		const registeredBlocks = blocksAPI
			.getBlockTypes()
			.map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual(
			expect.arrayContaining( jetpackBlocks )
		);
	} );

	it( 'should not register Jetpack blocks if Jetpack is not active', () => {
		setupJetpackEditor( { ...defaultJetpackData, isJetpackActive: false } );
		const blocksAPI = registerJetpackBlocksIsolated( defaultProps );

		const registeredBlocks = blocksAPI
			.getBlockTypes()
			.map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual( [] );
	} );

	it( 'should hide Jetpack blocks by capabilities', () => {
		setupJetpackEditor( defaultJetpackData );
		registerJetpackBlocksIsolated( {
			capabilities: {
				mediaFilesCollectionBlock: true,
				contactInfoBlock: false,
				tiledGalleryBlock: true,
			},
		} );

		const hiddenBlockTypes = select( 'core/preferences' ).get(
			'core/edit-post',
			'hiddenBlockTypes'
		);
		expect( hiddenBlockTypes ).toEqual( [ 'jetpack/contact-info' ] );
	} );

	it( "should not register Jetpack blocks if 'onlyCoreBlocks' capbility is on", () => {
		setupJetpackEditor( defaultJetpackData );
		const blocksAPI = registerJetpackBlocksIsolated( {
			capabilities: {
				...defaultProps.capabilities,
				onlyCoreBlocks: true,
			},
		} );

		const registeredBlocks = blocksAPI
			.getBlockTypes()
			.map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual( [] );
	} );

	describe( 'Jetpack embed variations', () => {
		afterEach( () => {
			// Clean up embed variations
			getBlockVariations( 'core/embed' ).forEach( ( variation ) => {
				unregisterBlockVariation( 'core/embed', variation.name );
			} );

			// Embed variations can use the register block type WP hook to reactivate
			// already registered variations, so we need to remove all hooks after the tests.
			removeAllFilters( 'blocks.registerBlockType' );

			// Clean up registered blocks
			getBlockTypes().forEach( ( block ) => {
				unregisterBlockType( block.name );
			} );
		} );

		it( 'should not register Jetpack embed variations if Jetpack is not active', () => {
			setupJetpackEditor( {
				...defaultJetpackData,
				isJetpackActive: false,
			} );
			registerJetpackEmbedVariations( defaultProps );
			// Embed variations require the Embed block to be registered,
			// so we need to register the core blocks to include it.
			registerCoreBlocks();

			const embedVariations = getBlockVariations(
				'core/embed',
				'inserter'
			).map( ( block ) => block.name );

			jetpackEmbedVariations.forEach( ( variation ) =>
				expect( embedVariations ).not.toContain( variation )
			);
		} );

		it( 'should not register Jetpack embed variations if capabilities are falsey', () => {
			setupJetpackEditor( defaultJetpackData );
			registerJetpackEmbedVariations( {
				capabilities: {
					facebookEmbed: false,
					instagramEmbed: null,
					loomEmbed: undefined,
				},
			} );
			// Embed variations require the Embed block to be registered,
			// so we need to register the core blocks to include it.
			registerCoreBlocks();

			const embedVariations = getBlockVariations(
				'core/embed',
				'inserter'
			).map( ( block ) => block.name );

			jetpackEmbedVariations.forEach( ( variation ) =>
				expect( embedVariations ).not.toContain( variation )
			);
		} );

		it( "should not register Jetpack embed variations if 'onlyCoreBlocks' capbility is on", () => {
			setupJetpackEditor( defaultJetpackData );
			registerJetpackEmbedVariations( {
				capabilities: {
					...defaultProps.capabilities,
					onlyCoreBlocks: true,
				},
			} );
			// Embed variations require the Embed block to be registered,
			// so we need to register the core blocks to include it.
			registerCoreBlocks();

			const embedVariations = getBlockVariations(
				'core/embed',
				'inserter'
			).map( ( block ) => block.name );

			jetpackEmbedVariations.forEach( ( variation ) =>
				expect( embedVariations ).not.toContain( variation )
			);
		} );

		it( 'should register Jetpack embed variations if capabilities are true', () => {
			setupJetpackEditor( defaultJetpackData );
			registerJetpackEmbedVariations( defaultProps );
			// Embed variations require the Embed block to be registered,
			// so we need to register the core blocks to include it.
			registerCoreBlocks();

			const embedVariations = getBlockVariations(
				'core/embed',
				'inserter'
			).map( ( block ) => block.name );

			expect( embedVariations ).toEqual(
				expect.arrayContaining( jetpackEmbedVariations )
			);
		} );
	} );
} );
