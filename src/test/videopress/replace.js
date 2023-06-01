/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { requestImageUploadCancelDialog } from '@wordpress/react-native-bridge';
import prompt from 'react-native-prompt-android';

/**
 * External dependencies
 */
import {
	act,
	fireEvent,
	getBlock,
	getEditorHtml,
	initializeEditor,
	setupCoreBlocks,
	setupMediaUpload,
	setupMediaPicker,
	setupPicker,
	setupApiFetch,
} from 'test/helpers';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';
import {
	expectShowMediaOptions,
	generateFetchMocks,
	generateBlockHTML,
	generateUploadMetadata,
	generateRemoteMedia,
	generateLocalMedia,
	generateLibraryMedia,
} from './local-helpers/utils';
import { MEDIA_OPTIONS } from './local-helpers/constants';

jest.mock( '@wordpress/api-fetch' );
jest.mock( 'react-native-prompt-android', () => jest.fn() );

const GUID_INITIAL_VIDEO = 'OLDxGUID';
const GUID_REPLACE_VIDEO = 'NEWxGUID';

setupCoreBlocks();

beforeAll( () => {
	// Register VideoPress block
	setupJetpackEditor( { blogId: 1, isJetpackActive: true } );
	registerJetpackBlocks( { capabilities: { videoPressBlock: true } } );
} );

beforeEach( () => {
	// Invalidate `getEmbedPreview` resolutions to avoid
	// caching the preview for the same VideoPress GUID.
	dispatch( coreStore ).invalidateResolutionForStoreSelector(
		'getEmbedPreview'
	);

	// Mock API responses for initial block.
	setupApiFetch(
		generateFetchMocks( {
			guid: GUID_INITIAL_VIDEO,
			metadata: {
				title: 'Video to be replaced',
			},
		} )
	);
} );

describe( 'VideoPress block - Replace', () => {
	it( 'displays media options picker when replacing the video', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML(),
		} );
		const { getByLabelText } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Observe that media options picker is displayed
		expectShowMediaOptions( screen, {
			title: 'Replace video',
			options: MEDIA_OPTIONS,
		} );
	} );

	it( 'replaces with a local video', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML( { guid: GUID_INITIAL_VIDEO } ),
		} );
		const { getByLabelText, getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		expect( getEditorHtml() ).toMatchSnapshot( 'before replacing video' );

		// Setup pickers and media upload
		const { notifySucceedState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Mock API responses for new block
		setupApiFetch(
			generateFetchMocks( {
				guid: GUID_REPLACE_VIDEO,
				metadata: {
					title: 'Local video from device',
				},
			} )
		);

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Upload video from device
		selectOption( 'Choose from device' );
		expectMediaPickerCall( 'DEVICE_MEDIA_LIBRARY', [ 'video' ], false );
		await mediaPickerCallback( generateLocalMedia() );

		// Upload succeed
		await notifySucceedState( {
			...generateRemoteMedia(),
			...generateUploadMetadata( GUID_REPLACE_VIDEO ),
		} );

		expect( getByTestId( 'videopress-player' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'after replacing video' );
	} );

	it( 'takes a new video', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML( { guid: GUID_INITIAL_VIDEO } ),
		} );
		const { getByLabelText, getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		expect( getEditorHtml() ).toMatchSnapshot( 'before replacing video' );

		// Setup pickers and media upload
		const { notifySucceedState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Mock API responses for new block
		setupApiFetch(
			generateFetchMocks( {
				guid: GUID_REPLACE_VIDEO,
				metadata: {
					title: 'Recorded within the editor',
				},
			} )
		);

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Take a video and upload it
		selectOption( 'Take a Video' );
		expectMediaPickerCall( 'DEVICE_CAMERA', [ 'video' ], false );
		await mediaPickerCallback( generateLocalMedia() );

		// Upload succeed
		await notifySucceedState( {
			...generateRemoteMedia(),
			...generateUploadMetadata( GUID_REPLACE_VIDEO ),
		} );

		expect( getByTestId( 'videopress-player' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'after replacing video' );
	} );

	it( 'replaces with video from media library', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML( { guid: GUID_INITIAL_VIDEO } ),
		} );
		const { getByLabelText, getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		expect( getEditorHtml() ).toMatchSnapshot( 'before replacing video' );

		// Setup pickers
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Mock API responses for new block
		setupApiFetch(
			generateFetchMocks( {
				guid: GUID_REPLACE_VIDEO,
				metadata: {
					title: 'Video from media library',
				},
			} )
		);

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Add video from WordPress media library
		selectOption( 'WordPress Media Library' );
		expectMediaPickerCall( 'SITE_MEDIA_LIBRARY', [ 'video' ], false );
		await mediaPickerCallback(
			generateLibraryMedia( { guid: GUID_REPLACE_VIDEO } )
		);

		expect( getByTestId( 'videopress-player' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'after replacing video' );
	} );

	it( 'replaces with new URL', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML( { guid: GUID_INITIAL_VIDEO } ),
		} );
		const { getByLabelText, getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		expect( getEditorHtml() ).toMatchSnapshot( 'before replacing video' );

		// Setup pickers
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Mock API responses for new block
		setupApiFetch(
			generateFetchMocks( {
				guid: GUID_REPLACE_VIDEO,
				metadata: {
					title: 'Video from URL',
				},
			} )
		);

		// Mock prompt dialog
		let promptApply;
		prompt.mockImplementation( ( title, message, [ , apply ] ) => {
			promptApply = apply.onPress;
		} );

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Insert video from URL
		selectOption( 'Insert from URL' );
		expect( prompt ).toHaveBeenCalled();
		await act( () =>
			promptApply( `https://videopress.com/v/${ GUID_REPLACE_VIDEO }` )
		);

		expect( getByTestId( 'videopress-player' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'after replacing video' );
	} );

	it( 'restores previous video when canceling a video replacement', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML( { guid: GUID_INITIAL_VIDEO } ),
		} );
		const { getByLabelText, getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();
		fireEvent.press( block );

		expect( getEditorHtml() ).toMatchSnapshot( 'before replacing video' );

		// Setup pickers and media upload
		const { notifyUploadingState, notifyResetState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Mock API responses for new block
		setupApiFetch(
			generateFetchMocks( {
				guid: GUID_REPLACE_VIDEO,
				metadata: {
					title: 'Local video from device',
				},
			} )
		);

		// Replace video
		fireEvent.press( getByLabelText( 'Edit video' ) );

		// Upload video from device
		selectOption( 'Choose from device' );
		expectMediaPickerCall( 'DEVICE_MEDIA_LIBRARY', [ 'video' ], false );
		const localMedia = generateLocalMedia();
		await mediaPickerCallback( localMedia );
		await notifyUploadingState( localMedia );

		// During upload progress we keep displaying the loading state
		const uploadingVideoView = getByTestId( 'videopress-uploading-video' );
		expect( uploadingVideoView ).toBeVisible();

		// Cancel upload
		fireEvent.press( uploadingVideoView );
		expect( requestImageUploadCancelDialog ).toHaveBeenCalledWith(
			localMedia.localId
		);
		await notifyResetState( localMedia );

		expect( getByTestId( 'videopress-player' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot(
			'after canceling replacement'
		);
	} );
} );
