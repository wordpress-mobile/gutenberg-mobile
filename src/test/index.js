/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { store as editPostStore } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import getJetpackData, {
	JETPACK_DATA_PATH,
} from '../../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../jetpack-editor-setup';

const defaultJetpackData = { blogId: 1, isJetpackActive: true };
const defaultProps = {
	capabilities: {
		mediaFilesCollectionBlock: true,
		contactInfoBlock: true,
	},
};
const jetpackBlocks = [ 'jetpack/contact-info', 'jetpack/story' ];

// Jetpack blocks are registered when importing the editor extension module.
// Since we need to register the blocks multiple times for testing,
// it's required to isolate modules for re-importing the editor extension multiple times.
const registerJetpackBlocksIsolated = ( props ) => {
	jest.isolateModules( () => {
		registerJetpackBlocks( props );
	} );
};

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
		registerJetpackBlocksIsolated( defaultProps );

		const registeredBlocks = getBlockTypes().map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual(
			expect.arrayContaining( jetpackBlocks )
		);
	} );

	it( 'should not register Jetpack blocks if Jetpack is not active', () => {
		setupJetpackEditor( { ...defaultJetpackData, isJetpackActive: false } );
		registerJetpackBlocksIsolated( defaultProps );

		const registeredBlocks = getBlockTypes().map( ( block ) => block.name );
		expect( registeredBlocks ).toEqual( [] );
	} );

	it( 'should hide Jetpack blocks by capabilities', () => {
		setupJetpackEditor( defaultJetpackData );
		registerJetpackBlocksIsolated( {
			capabilities: {
				mediaFilesCollectionBlock: true,
				contactInfoBlock: false,
			},
		} );

		const { hiddenBlockTypes } = select( editPostStore ).getPreferences();
		expect( hiddenBlockTypes ).toEqual( [ 'jetpack/contact-info' ] );
	} );
} );
