/**
 * External dependencies
 */
import {
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
import { Platform } from '@wordpress/element';
import { ActionSheetIOS } from 'react-native';
import apiFetch from '@wordpress/api-fetch';
import { dispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import {
	registerJetpackBlocks,
	setupJetpackEditor,
} from '../../jetpack-editor-setup';

jest.mock( '@wordpress/api-fetch' );

const initialHtml = '<!-- wp:videopress/video /-->';

const MEDIA_OPTIONS = [
	'Choose from device',
	'Take a Video',
	'WordPress Media Library',
	'Insert from URL',
];

const VIDEOPRESS_GUID = 'AbCdEfGh';
const FETCH_ITEMS = [
	{
		request: {
			path: `/wpcom/v2/media/videopress-playback-jwt/${ VIDEOPRESS_GUID }`,
			method: 'POST',
			body: {},
		},
		response: {
			metadata_token: 'videopress-token',
		},
	},
	{
		request: {
			path: `/rest/v1.1/videos/${ VIDEOPRESS_GUID }`,
			credentials: 'omit',
			global: true,
		},
		response: {
			description: 'video-description',
			post_id: 1,
			guid: VIDEOPRESS_GUID,
			private_enabled_for_site: false,
			title: 'video-title',
			duration: 1200,
			privacy_setting: 2,
			original: `https://videos.files.wordpress.com/${ VIDEOPRESS_GUID }/video.mp4`,
			allow_download: false,
			display_embed: true,
			poster: `https://videos.files.wordpress.com/${ VIDEOPRESS_GUID }/video.jpg`,
			height: 270,
			width: 480,
			rating: 'G',
			is_private: false,
		},
	},
	{
		request: {
			path: `/oembed/1.0/proxy?url=https%3A%2F%2Fvideopress.com%2Fv%2F${ VIDEOPRESS_GUID }%3FresizeToParent%3Dtrue%26cover%3Dtrue%26preloadContent%3Dmetadata`,
		},
		response: {
			height: 338,
			provider_name: 'VideoPress',
			html: `<iframe title='VideoPress Video Player' width='600' height='338' src='https://video.wordpress.com/embed/${ VIDEOPRESS_GUID }?cover=1&amp;preloadContent=metadata&amp;hd=1' frameborder='0' allowfullscreen data-resize-to-parent='true' allow='clipboard-write'></iframe>`,
			width: 600,
			type: 'video',
		},
	},
];

const sendWebViewMessage = ( webView, message ) =>
	fireEvent( webView, 'message', {
		nativeEvent: {
			data: JSON.stringify( message ),
		},
	} );

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
		const player = getByTestId( 'videopress-player' );

		// Notify the player is ready
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

	it.skip( 'adds video by inserting URL', async () => {} );

	it.skip( 'finishes pending uploads upon opening the editor', async () => {} );
	it.skip( 'handles upload failure', async () => {} );
	it.skip( 'cancel upload', async () => {} );

	it.skip( 'sets caption', async () => {} );

	it.skip( 'replace video with local video', async () => {} );
	it.skip( 'replace video taking a new one', async () => {} );
	it.skip( 'replace video video item from media library', async () => {} );
	it.skip( 'replace video video with new URL', async () => {} );
} );
