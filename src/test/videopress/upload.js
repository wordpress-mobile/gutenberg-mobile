/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { dispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	requestImageFailedRetryDialog,
	requestImageUploadCancelDialog,
} from '@wordpress/react-native-bridge';

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
	within,
	setupPicker,
	setupApiFetch,
} from 'test/helpers';
import { ActionSheetIOS } from 'react-native';
import prompt from 'react-native-prompt-android';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';
import { generateFetchMocks, sendWebViewMessage } from './local-helpers/utils';
import {
	VIDEOPRESS_EMPTY_BLOCK_HTML,
	MEDIA_OPTIONS,
	VIDEOPRESS_GUID,
} from './local-helpers/constants';

jest.mock( '@wordpress/api-fetch' );
jest.mock( 'react-native-prompt-android', () => jest.fn() );

const initialHtml = VIDEOPRESS_EMPTY_BLOCK_HTML;
const FETCH_ITEMS = generateFetchMocks();

setupCoreBlocks();

beforeAll( () => {
	// Register VideoPress block
	setupJetpackEditor( {
		blogId: 1,
		isJetpackActive: true,
	} );
	registerJetpackBlocks( {
		capabilities: { videoPressBlock: true },
	} );

	// Mock request reponses
	setupApiFetch( FETCH_ITEMS );
} );

beforeEach( () => {
	// Invalidate `getEmbedPreview` resolutions to avoid
	// caching the preview for the same VideoPress GUID.
	dispatch( coreStore ).invalidateResolutionForStoreSelector(
		'getEmbedPreview'
	);
} );

describe( 'VideoPress block - Uploads', () => {
	it( 'displays media options picker when selecting the block', async () => {
		// Initialize with an empty gallery
		const {
			getByLabelText,
			getByText,
			getByTestId,
		} = await initializeEditor( {
			initialHtml,
		} );

		fireEvent.press( getByText( 'ADD VIDEO' ) );

		// Observe that media options picker is displayed
		if ( Platform.isIOS ) {
			// On iOS the picker is rendered natively, so we have
			// to check the arguments passed to `ActionSheetIOS`.
			expect(
				ActionSheetIOS.showActionSheetWithOptions
			).toHaveBeenCalledWith(
				expect.objectContaining( {
					title: 'Choose video',
					options: [ 'Cancel', ...MEDIA_OPTIONS ],
				} ),
				expect.any( Function )
			);
		} else {
			expect( getByText( 'Choose video' ) ).toBeVisible();
			MEDIA_OPTIONS.forEach( ( option ) =>
				expect( getByText( option ) ).toBeVisible()
			);

			fireEvent( getByTestId( 'media-options-picker' ), 'backdropPress' );
		}

		// Check that block remains selected after displaying the media
		// options picker. This is performed by checking if the block
		// actions menu button is visible.
		const blockActionsButton = getByLabelText( /Open Block Actions Menu/ );
		expect( blockActionsButton ).toBeVisible();
	} );

	it( 'uploads a video from device', async () => {
		const media = {
			type: 'video',
			localId: 1,
			localUrl: 'file:///local-video-1.mp4',
			serverId: 1000,
			serverUrl: 'https://videopress.wordpress.com/local-video-1.mp4',
		};

		const { notifyUploadingState, notifySucceedState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );
		// Clear previous calls to `apiFetch`
		apiFetch.mockClear();

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Upload video from device
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'Choose from device' );
		expectMediaPickerCall( 'DEVICE_MEDIA_LIBRARY', [ 'video' ], false );

		// Block is uploading the video
		await mediaPickerCallback( media );
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'loading state' );

		// During upload progress we keep displaying the loading state
		await notifyUploadingState( media );
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();

		// Upload finish
		await notifySucceedState( {
			...media,
			metadata: Platform.select( {
				android: {
					videopressGUID: VIDEOPRESS_GUID,
				},
				ios: {
					id: VIDEOPRESS_GUID,
				},
			} ),
		} );

		// Requests:
		//  - Token request
		//  - Metadata request
		//  - Check ownership request
		//  - Oembed request
		FETCH_ITEMS.forEach( ( fetch ) =>
			expect( apiFetch ).toHaveBeenCalledWith( fetch.request )
		);

		// Check loading overlay is displayed before the player is ready
		expect( within( block ).getByText( 'Loading' ) ).toBeVisible();

		// Notify the player is ready
		const player = getByTestId( 'videopress-player' );
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_ready',
		} );
		expect( player ).toBeVisible();

		// At this point the player should be showing the conversion state.
		// Hence, let's notify the loaded state.
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_loading_state',
			state: 'loaded',
		} );

		// At this point the player should be ready to be used.
		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot( 'video ready' );
	} );

	it( 'uploads a video from media library', async () => {
		const media = {
			type: 'video',
			id: 2000,
			url: 'https://test.files.wordpress.com/local-video-2.mp4',
			metadata: {
				videopressGUID: VIDEOPRESS_GUID,
			},
		};
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );
		// Clear previous calls to `apiFetch`
		apiFetch.mockClear();

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Add video from WordPress media library
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'WordPress Media Library' );
		expectMediaPickerCall( 'SITE_MEDIA_LIBRARY', [ 'video' ], false );

		await mediaPickerCallback( media );

		// Requests:
		//  - Token request
		//  - Metadata request
		//  - Check ownership request
		//  - Oembed request
		FETCH_ITEMS.forEach( ( fetch ) =>
			expect( apiFetch ).toHaveBeenCalledWith( fetch.request )
		);

		// Check loading overlay is displayed before the player is ready
		expect( within( block ).getByText( 'Loading' ) ).toBeVisible();

		// Notify the player is ready
		const player = getByTestId( 'videopress-player' );
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_ready',
		} );
		expect( player ).toBeVisible();

		// At this point the player should be showing the conversion state.
		// Hence, let's notify the loaded state.
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_loading_state',
			state: 'loaded',
		} );

		// At this point the player should be ready to be used.
		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot( 'video ready' );
	} );

	it( 'takes a video and uploads it', async () => {
		const media = {
			type: 'video',
			localId: 3,
			localUrl: 'file:///local-video-3.mp4',
			serverId: 3000,
			serverUrl: 'https://videopress.wordpress.com/local-video-3.mp4',
		};

		const { notifyUploadingState, notifySucceedState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );
		// Clear previous calls to `apiFetch`
		apiFetch.mockClear();

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Take a video and upload it
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'Take a Video' );
		expectMediaPickerCall( 'DEVICE_CAMERA', [ 'video' ], false );

		// Block is uploading the video
		await mediaPickerCallback( media );
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();
		expect( getEditorHtml() ).toMatchSnapshot( 'loading state' );

		// During upload progress we keep displaying the loading state
		await notifyUploadingState( media );
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();

		// Upload finish
		await notifySucceedState( {
			...media,
			metadata: Platform.select( {
				android: {
					videopressGUID: VIDEOPRESS_GUID,
				},
				ios: {
					id: VIDEOPRESS_GUID,
				},
			} ),
		} );

		// Requests:
		//  - Token request
		//  - Metadata request
		//  - Check ownership request
		//  - Oembed request
		FETCH_ITEMS.forEach( ( fetch ) =>
			expect( apiFetch ).toHaveBeenCalledWith( fetch.request )
		);

		// Check loading overlay is displayed before the player is ready
		expect( within( block ).getByText( 'Loading' ) ).toBeVisible();

		// Notify the player is ready
		const player = getByTestId( 'videopress-player' );
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_ready',
		} );
		expect( player ).toBeVisible();

		// At this point the player should be showing the conversion state.
		// Hence, let's notify the loaded state.
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_loading_state',
			state: 'loaded',
		} );

		// At this point the player should be ready to be used.
		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot( 'video ready' );
	} );

	it( 'adds video by inserting URL', async () => {
		let promptApply;
		prompt.mockImplementation( ( title, message, [ , apply ] ) => {
			promptApply = apply.onPress;
		} );

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );
		// Clear previous calls to `apiFetch`
		apiFetch.mockClear();

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Insert video from URL
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'Insert from URL' );
		expect( prompt ).toHaveBeenCalled();

		// Mock prompt dialog
		await act( () =>
			promptApply( `https://videopress.com/v/${ VIDEOPRESS_GUID }` )
		);

		// Requests:
		//  - Token request
		//  - Metadata request
		//  - Check ownership request
		//  - Oembed request
		FETCH_ITEMS.forEach( ( fetch ) =>
			expect( apiFetch ).toHaveBeenCalledWith( fetch.request )
		);

		// Check loading overlay is displayed before the player is ready
		expect( within( block ).getByText( 'Loading' ) ).toBeVisible();

		// Notify the player is ready
		const player = getByTestId( 'videopress-player' );
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_ready',
		} );
		expect( player ).toBeVisible();

		// At this point the player should be showing the conversion state.
		// Hence, let's notify the loaded state.
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_loading_state',
			state: 'loaded',
		} );

		// At this point the player should be ready to be used.
		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot( 'video ready' );
	} );

	it( 'finishes pending uploads upon opening the editor', async () => {
		const media = {
			type: 'video',
			localId: 4,
			localUrl: 'file:///local-video-4.mp4',
			serverId: 4000,
			serverUrl: 'https://videopress.wordpress.com/local-video-4.mp4',
		};
		const { notifyUploadingState, notifySucceedState } = setupMediaUpload();

		const screen = await initializeEditor( {
			initialHtml: `<!-- wp:videopress/video {"id":4,"src":"file:///local-video-4.mp4"} /-->`,
		} );
		const { getByTestId } = screen;

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Notify that the media items are uploading
		await notifyUploadingState( media );
		await notifyUploadingState( media );

		// During upload progress we keep displaying the loading state
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();

		// Upload finish
		await notifySucceedState( {
			...media,
			metadata: Platform.select( {
				android: {
					videopressGUID: VIDEOPRESS_GUID,
				},
				ios: {
					id: VIDEOPRESS_GUID,
				},
			} ),
		} );

		// Requests:
		//  - Token request
		//  - Metadata request
		//  - Check ownership request
		//  - Oembed request
		FETCH_ITEMS.forEach( ( fetch ) =>
			expect( apiFetch ).toHaveBeenCalledWith( fetch.request )
		);

		// Check loading overlay is displayed before the player is ready
		expect( within( block ).getByText( 'Loading' ) ).toBeVisible();

		// Notify the player is ready
		const player = getByTestId( 'videopress-player' );
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_ready',
		} );
		expect( player ).toBeVisible();

		// At this point the player should be showing the conversion state.
		// Hence, let's notify the loaded state.
		sendWebViewMessage( player, {
			type: 'message',
			event: 'videopress_loading_state',
			state: 'loaded',
		} );

		// At this point the player should be ready to be used.
		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'handles upload failure', async () => {
		const media = {
			type: 'video',
			localId: 1,
			localUrl: 'file:///local-video-1.mp4',
			serverId: 1000,
			serverUrl: 'https://videopress.wordpress.com/local-video-1.mp4',
		};

		const { notifyUploadingState, notifyFailedState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Upload video from device
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'Choose from device' );
		expectMediaPickerCall( 'DEVICE_MEDIA_LIBRARY', [ 'video' ], false );

		// Block is uploading the video
		await mediaPickerCallback( media );
		await notifyUploadingState( media );

		// During upload progress we keep displaying the loading state
		expect( getByTestId( 'videopress-uploading-video' ) ).toBeVisible();

		// Notify that the upload failed
		await notifyFailedState( media );
		const uploadFailText = getByText( /Failed to insert media/ );
		expect( uploadFailText ).toBeVisible();

		// Retry option available
		fireEvent.press( uploadFailText );
		expect( requestImageFailedRetryDialog ).toHaveBeenCalledWith(
			media.localId
		);
		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'cancel upload', async () => {
		const media = {
			type: 'video',
			localId: 1,
			localUrl: 'file:///local-video-1.mp4',
			serverId: 1000,
			serverUrl: 'https://videopress.wordpress.com/local-video-1.mp4',
		};

		const { notifyUploadingState, notifyResetState } = setupMediaUpload();
		const {
			expectMediaPickerCall,
			mediaPickerCallback,
		} = setupMediaPicker();

		const screen = await initializeEditor( {
			initialHtml,
		} );
		const { getByText, getByTestId } = screen;
		const { selectOption } = setupPicker( screen, MEDIA_OPTIONS );

		// Block is visible
		const block = await getBlock( screen, 'VideoPress' );
		expect( block ).toBeVisible();

		// Upload video from device
		fireEvent.press( getByText( 'ADD VIDEO' ) );
		selectOption( 'Choose from device' );
		expectMediaPickerCall( 'DEVICE_MEDIA_LIBRARY', [ 'video' ], false );

		// Block is uploading the video
		await mediaPickerCallback( media );
		await notifyUploadingState( media );

		// During upload progress we keep displaying the loading state
		const uploadingVideoView = getByTestId( 'videopress-uploading-video' );
		expect( uploadingVideoView ).toBeVisible();

		// Cancel upload
		fireEvent.press( uploadingVideoView );
		expect( requestImageUploadCancelDialog ).toHaveBeenCalledWith(
			media.localId
		);
		await notifyResetState( media );

		expect( within( block ).queryByText( 'Loading' ) ).toBeNull();
		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
