/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
// import { JetpackLogo } from '../../jetpack/extensions/shared/icons';
// import { JetpackLogo } from '../../jetpack/extensions/shared/icons';

// import { NoticeList } from '../../gutenberg/packages/components/src/notice/list';


jest.mock( '@wordpress/data/build/components/use-select' );
jest.mock( '@wordpress/data/build/components/use-dispatch' );
// jest.mock('../../jetpack/extensions/shared/icons');

// jest.mock('../../gutenberg/packages/components/src/notice/list');

describe( 'Test Jetpack blocks', () => {
	it( 'should setup the editor for jetpack without failing', () => {
		useSelect.mockImplementation( () => {
			return {
				mediaFilesCollectionBlock: true,
			};
		} );

		useDispatch.mockImplementation( () => {
			return {
				hideBlockTypes: jest.fn(),
				showBlockTypes: jest.fn(),
			}	
		} );

		// JetpackLogo.mockImplementation( () => { return 'JetpackLogo' }  );
		// NoticeList.mockImplementation( () => { return 'NoticeList' }  );

		const mockRegisterBlockCollection = jest.fn();
		jest.mock( '@wordpress/blocks', () => {
			return {
				getCategories: () => [ { slug: 'media' } ],
				setCategories: jest.fn(),
				registerBlockCollection: mockRegisterBlockCollection,
			};
		} );
		jest.mock(
			'../../jetpack/extensions/blocks/contact-info/editor.js',
			() => jest.fn()
		);
		jest.mock( '../../jetpack/extensions/blocks/story/editor.js', () =>
			jest.fn()
		);

		const setupJetpackEditor = require( '../jetpack-editor-setup' ).default;
		setupJetpackEditor( { blogId: 1, isJetpackActive: true } );

		expect( mockRegisterBlockCollection.mock.calls[ 0 ][ 0 ] ).toBe(
			'jetpack'
		);
	} );
} );
