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
import { store as editPostStore } from '@wordpress/edit-post';
import { registerCoreBlocks } from '@wordpress/block-library';
import { removeAllFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import getJetpackData, {
	JETPACK_DATA_PATH,
} from '../../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';
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
];
const jetpackEmbedVariations = [
	'facebook',
	'instagram',
	'loom',
	'smartframe',
];

describe( 'Jetpack blocks', () => {
	afterEach( () => {
		// Reset Jetpack data
		delete global.window[ JETPACK_DATA_PATH ];

		// Clean up registered blocks
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
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
		registerJetpackBlocks( defaultProps );

		const registeredBlocks = getBlockTypes().map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual(
			expect.arrayContaining( jetpackBlocks )
		);
	} );

	it( 'should not register Jetpack blocks if Jetpack is not active', () => {
		setupJetpackEditor( { ...defaultJetpackData, isJetpackActive: false } );
		registerJetpackBlocks( defaultProps );

		const registeredBlocks = getBlockTypes().map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual( [] );
	} );

	it( 'should hide Jetpack blocks by capabilities', () => {
		setupJetpackEditor( defaultJetpackData );
		registerJetpackBlocks( {
			capabilities: {
				mediaFilesCollectionBlock: true,
				contactInfoBlock: false,
				tiledGalleryBlock: true,
			},
		} );

		const { hiddenBlockTypes } = select( editPostStore ).getPreferences();
		expect( hiddenBlockTypes ).toEqual( [ 'jetpack/contact-info' ] );
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
