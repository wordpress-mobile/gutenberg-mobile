import {
	getBlockTypes,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { defaultHooks } from '@wordpress/hooks';
import { JETPACK_DATA_PATH } from '../../jetpack/projects/plugins/jetpack/extensions/shared/get-jetpack-data';

/**
 * These are integration tests written with the intention of asserting the initialization of the Gutenberg Mobile
 * editor. As they are integration tests, modules that were being mocked globally are now unmocked to use their
 * real implementations.
 *
 * The intention of these integration tests is to ensure that:
 * 0. Jetpack initialization is handled correctly by registering the Jetpack Block Collection, initializing Jetpack Data,
 *    and registering all Jetpack Block Types that you may be capable of using.
 * 1. Allowed block types are displayed correctly in the block selector if a subset of blocks is provided to be shown
 *    or hidden.
 *
 * The tests are staged such that `require( '../index' )` mimics the entry point of the initialization of the Gutenberg
 * Mobile editor, and `defaultHooks.doAction( 'native.render', props )` is the `native.render` hook that would normally be
 * listened for when the editor is initializing. So all the tests ensure that when certain `props` are passed in from the
 * `native.render` hook that the underlying Redux Store state is reduced expectedly. This is deliberately done to keep
 * the tests as black-box as possible such that the implementation details of the application code may be changed more
 * freely without a tight coupling on the code that tests it.
 */
describe( 'Gutenberg Mobile Initialization', () => {
	beforeAll( () => {
		jest.unmock( '@wordpress/api-fetch' );
		jest.unmock( '@wordpress/blocks' );
	} );

	describe( 'Jetpack Blocks', () => {
		it( `should register Jetpack block collection.`, () => {
			// Arrange
			const expectedCollectionTitle = 'Jetpack';
			const props = { jetpackState: { isJetpackActive: false } };
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const { getCollections } = select( 'core/blocks' );
			const {
				jetpack: { title: actualCollectionTitle = '' } = {},
			} = getCollections();
			expect( actualCollectionTitle ).toEqual( expectedCollectionTitle );
		} );

		it( `should NOT register JETPACK_DATA_PATH when Jetpack is INACTIVE.`, () => {
			// Arrange
			const expectedJetpackData = undefined;
			const props = { jetpackState: { isJetpackActive: false } };
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualJetpackData = global.window[ JETPACK_DATA_PATH ];
			expect( actualJetpackData ).toEqual( expectedJetpackData );
		} );

		it( `should register JETPACK_DATA_PATH with DEFAULT values when Jetpack is ACTIVE
	         AND Jetpack state is UNPROVIDED.`, () => {
			// Arrange
			const expectedJetpackData = {
				available_blocks: {
					'contact-info': { available: true },
					'layout-grid': { available: true },
					story: { available: true },
				},
				jetpack: { is_active: true },
				siteFragment: null,
				tracksUserData: null,
				wpcomBlogId: 1,
			};
			const props = { jetpackState: { isJetpackActive: true } };
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualJetpackData = global.window[ JETPACK_DATA_PATH ];
			expect( actualJetpackData ).toEqual( expectedJetpackData );
		} );

		it( `should register JETPACK_DATA_PATH with CUSTOM values when Jetpack is ACTIVE
	         AND Jetpack state is PROVIDED.`, () => {
			// Arrange
			const expectedJetpackData = {
				available_blocks: {
					'contact-info': { available: true },
					'layout-grid': { available: true },
					story: { available: true },
				},
				jetpack: { is_active: true },
				siteFragment: '#fragment',
				tracksUserData: {},
				wpcomBlogId: 1337,
			};
			const props = {
				jetpackState: {
					isJetpackActive: true,
					siteFragment: '#fragment',
					userData: {},
					blogId: 1337,
				},
			};
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualJetpackData = global.window[ JETPACK_DATA_PATH ];
			expect( actualJetpackData ).toEqual( expectedJetpackData );
		} );

		it( `should NOT register "jetpack/*" block types when Jetpack is INACTIVE
	         AND you are INCAPABLE.`, () => {
			// Arrange
			const expectedBlockTypes = [];
			const props = {
				jetpackState: { isJetpackActive: false },
				capabilities: {
					layoutGridBlock: false,
					mediaFilesCollectionBlock: false,
					contactInfoBlock: false,
				},
			};
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualBlockTypes = getBlockTypes();
			expect( actualBlockTypes ).toEqual( expectedBlockTypes );
		} );

		it( `should NOT register "jetpack/*" block types when Jetpack is INACTIVE
	         even if you are CAPABLE.`, () => {
			// Arrange
			const expectedBlockTypes = [];
			const props = {
				jetpackState: { isJetpackActive: false },
				capabilities: {
					layoutGridBlock: true,
					mediaFilesCollectionBlock: true,
					contactInfoBlock: true,
				},
			};
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualBlockTypes = getBlockTypes();
			expect( actualBlockTypes ).toEqual( expectedBlockTypes );
		} );

		it( `should NOT register "jetpack/*" block types when Jetpack is ACTIVE
	         AND you are INCAPABLE.`, () => {
			// Arrange
			const expectedBlockTypes = [];
			const props = {
				jetpackState: { isJetpackActive: true },
				capabilities: {
					layoutGridBlock: false,
					mediaFilesCollectionBlock: false,
					contactInfoBlock: false,
				},
			};
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualBlockTypes = getBlockTypes();
			expect( actualBlockTypes ).toEqual( expectedBlockTypes );
		} );

		it( `should register the "jetpack/*" block types when Jetpack is ACTIVE
	         AND you are CAPABLE.`, () => {
			// Arrange
			const expectedBlockTypes = [
				'jetpack/address',
				'jetpack/contact-info',
				'jetpack/email',
				'jetpack/layout-grid',
				'jetpack/layout-grid-column',
				'jetpack/phone',
				'jetpack/story',
			].sort();
			const props = {
				jetpackState: { isJetpackActive: true },
				capabilities: {
					layoutGridBlock: true,
					mediaFilesCollectionBlock: true,
					contactInfoBlock: true,
				},
			};
			require( '../index' );
			// Act
			defaultHooks.doAction( 'native.render', props );
			// Assert
			const actualBlockTypes = getBlockTypes()
				.map( ( { name } ) => name )
				.sort();
			expect( actualBlockTypes ).toEqual( expectedBlockTypes );
		} );

		afterAll( () => {
			[
				'jetpack/address',
				'jetpack/contact-info',
				'jetpack/email',
				'jetpack/layout-grid',
				'jetpack/layout-grid-column',
				'jetpack/phone',
				'jetpack/story',
			].forEach( ( name ) => {
				unregisterBlockType( name );
			} );
		} );
	} );

	describe( 'Allowed Blocks', () => {
		beforeAll( () => {
			[ 'core/audio', 'jetpack/story' ].forEach( ( name ) =>
				registerBlockType( name, { title: name } )
			);
		} );

		describe( 'Allow ALL REGISTERED Blocks', () => {
			it( `should show ALL REGISTERED block types when NONE are provided.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = {};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should NOT hide ALL OTHER block types when the provided block type to be shown is UNREGISTERED.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = { showBlocks: [ 'jetpack/unregistered' ] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should show ALL REGISTERED block types when ALL REGISTERED block types are provided to be shown.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = {
					showBlocks: [ 'core/audio', 'jetpack/story' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should NOT hide the provided block type when it is UNREGISTERED.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = { hideBlocks: [ 'jetpack/unregistered' ] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should NOT hide ANY provided block types that are ambiguously asked to be shown.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = {
					hideBlocks: [ 'core/audio', 'jetpack/story' ],
					showBlocks: [ 'jetpack/story', 'core/audio' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should NOT hide ANY provided UNREGISTERED block type that is ambiguously asked to be shown.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [];
				const props = {
					hideBlocks: [ 'jetpack/unregistered' ],
					showBlocks: [ 'jetpack/unregistered' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );
		} );

		describe( 'Allow SOME REGISTERED Blocks', () => {
			it( `should hide ALL OTHER block types when the provided block type to be shown is REGISTERED.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [ 'jetpack/story' ];
				const props = { showBlocks: [ 'core/audio' ] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should hide ALL OTHER block types when the provided block types to be shown are REGISTERED AND UNREGISTERED.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [ 'jetpack/story' ];
				const props = {
					showBlocks: [ 'core/audio', 'jetpack/unregistered' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should hide ANY REGISTERED block types when ANY REGISTERED block types are provided to be hidden.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [ 'jetpack/story' ];
				const props = { hideBlocks: [ 'jetpack/story' ] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should hide ANY REGISTERED block types when the provided block types to be hidden are REGISTERED AND UNREGISTERED.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [ 'jetpack/story' ];
				const props = {
					hideBlocks: [ 'jetpack/story', 'jetpack/unregistered' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should hide ANY provided REGISTERED block types that are also UNAMBIGUOUSLY asked to be NOT shown.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [ 'jetpack/story' ];
				const props = {
					hideBlocks: [ 'jetpack/story' ],
					showBlocks: [ 'core/audio' ],
				};
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				);
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );
		} );

		describe( 'Allow NO REGISTERED Blocks', () => {
			it( `should hide ALL REGISTERED block types when ALL REGISTERED block types are provided to be hidden.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [
					'core/audio',
					'jetpack/story',
				].sort();
				const props = { hideBlocks: [ 'core/audio', 'jetpack/story' ] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				).sort();
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );

			it( `should hide ALL REGISTERED block types when NO block types are provided to be shown.`, () => {
				// Arrange
				const expectedHiddenBlockTypes = [
					'core/audio',
					'jetpack/story',
				].sort();
				const props = { showBlocks: [] };
				require( '../index' );
				// Act
				defaultHooks.doAction( 'native.render', props );
				// Assert
				const { getPreference } = select( 'core/edit-post' );
				const actualHiddenBlockTypes = getPreference(
					'hiddenBlockTypes'
				).sort();
				expect( actualHiddenBlockTypes ).toEqual(
					expectedHiddenBlockTypes
				);
			} );
		} );

		afterAll( () => {
			[ 'core/audio', 'jetpack/story' ].forEach( ( name ) => {
				unregisterBlockType( name );
			} );
		} );
	} );
} );
