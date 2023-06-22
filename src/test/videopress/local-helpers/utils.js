/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';

/**
 * External dependencies
 */
import {
	act,
	getBlock,
	fireEvent,
	openBlockSettings,
	setupPicker,
} from 'test/helpers';
import { ActionSheetIOS } from 'react-native';

/**
 * Internal dependencies
 */
import { VIDEOPRESS_GUID } from './constants';

export const selectAndOpenBlockSettings = async ( screen ) => {
	const videoPressBlock = await getBlock( screen, 'VideoPress' );

	expect( videoPressBlock ).toBeVisible();

	await fireEvent.press( videoPressBlock );

	await openBlockSettings( screen );

	return { ...screen, videoPressBlock };
};

/**
 * Presses a setting in a specified panel.
 *
 * @param {Object} screen  - The editor's screen.
 * @param {string} panel   - The panel containing the setting to be pressed.
 * @param {string} setting - The setting to be pressed.
 */
export const pressSettingInPanel = async ( screen, panel, setting ) => {
	const { getByText } = screen;

	// Navigate to the specified settings panel
	fireEvent.press( getByText( panel ) );

	// Toggle the specified setting
	// TODO: Determine the cause of state updates and explicitly wait for them,
	// instead of wrapping firEvent in act.
	await act( () => fireEvent.press( getByText( setting ) ) );
};

/**
 * Presses a setting in a specified panel, triggers a picker, and selects an option from the sheet.
 *
 * @param {Object}   screen  - The editor's screen.
 * @param {string}   panel   - The panel containing the setting to be pressed.
 * @param {string}   setting - The setting to be pressed, which triggers the picker.
 * @param {string[]} options - An array of all the options available in the picker.
 * @param {string}   option  - The option to be selected from the picker.
 */
export const pressSettingInPicker = async (
	screen,
	panel,
	setting,
	options,
	option
) => {
	const { getByText } = screen;

	// Navigate to the specified settings panel
	fireEvent.press( getByText( panel ) );

	// Setup the picker and open picker
	const { selectOption } = setupPicker( screen, options );
	fireEvent.press( getByText( setting ) );

	// Select the specified option from the picker
	await act( () => selectOption( option ) );
};

/**
 * Sends a message event to a WebView.
 *
 * @param {*}      webView WebView test instance.
 * @param {Object} message Message object.
 */
export const sendWebViewMessage = ( webView, message ) =>
	fireEvent( webView, 'message', {
		nativeEvent: {
			data: JSON.stringify( message ),
		},
	} );

/**
 * Checks if media options picker is displayed.
 *
 * @param {*}      screen          The editor's screen.
 * @param {Object} options
 * @param {Object} options.title   Title displayed in the picker.
 * @param {Object} options.options Options displayed in the picker.
 */
export const expectShowMediaOptions = ( screen, { title, options } ) => {
	const { getByText } = screen;
	// Observe that media options picker is displayed
	if ( Platform.isIOS ) {
		// On iOS the picker is rendered natively, so we have
		// to check the arguments passed to `ActionSheetIOS`.
		expect(
			ActionSheetIOS.showActionSheetWithOptions
		).toHaveBeenCalledWith(
			expect.objectContaining( {
				title,
				options: [ 'Cancel', ...options ],
			} ),
			expect.any( Function )
		);
	} else {
		expect( getByText( title ) ).toBeVisible();
		options.forEach( ( option ) =>
			expect( getByText( option ) ).toBeVisible()
		);
	}
};

/**
 * Generates the HTML of the VideoPress block.
 *
 * @param {Object} options
 * @param {string} [options.guid]        VideoPress GUID.
 * @param {string} [options.title]       Title of the video.
 * @param {string} [options.description] Description of the video.
 * @param {string} [options.isPrivate]   True if the video is private.
 */
export const generateBlockHTML = ( {
	guid = VIDEOPRESS_GUID,
	title = 'default-title-is-file-name',
	description = '',
	isPrivate,
} = {} ) => {
	let privacySetting = 2; // Site default
	if ( typeof isPrivate !== 'undefined' ) {
		privacySetting = isPrivate ? 1 : 0;
	}
	return `<!-- wp:videopress/video {"title":"${ title }","description":"${ description }","useAverageColor":false,"id":1,"guid":"${ guid }","privacySetting":${ privacySetting },"allowDownload":false,"rating":"G","isPrivate":${ !! isPrivate },"duration":2803} /-->`;
};

/**
 * Generates the fetch mocks to be used in `setupApiFetch` helper.
 *
 * @param {Object} options
 * @param {string} [options.guid]      VideoPress GUID.
 * @param {string} [options.token]     Token of the video (only needed when the video is private).
 * @param {string} [options.metadata]  Metadata to be used in the response for the request
 *                                     of VideoPress metadata.
 * @param {string} [options.isPrivate] True if the video is private.
 */
export const generateFetchMocks = ( {
	guid = VIDEOPRESS_GUID,
	token = 'videopress-token',
	metadata = {},
	isPrivate,
} = {} ) => {
	let privacySetting = 2; // Site default
	if ( typeof isPrivate !== 'undefined' ) {
		privacySetting = isPrivate ? 1 : 0;
	}
	return [
		{
			request: {
				path: `/wpcom/v2/media/videopress-playback-jwt/${ guid }`,
				method: 'POST',
				body: {},
			},
			response: {
				metadata_token: token,
			},
		},
		{
			request: {
				path: isPrivate
					? `/rest/v1.1/videos/${ guid }?metadata_token=${ token }`
					: `/rest/v1.1/videos/${ guid }`,
				credentials: 'omit',
				global: true,
			},
			response: {
				description: 'video-description',
				post_id: 34,
				guid,
				private_enabled_for_site: false,
				title: 'video-title',
				duration: 1200,
				privacy_setting: privacySetting,
				original: `https://videos.files.wordpress.com/${ guid }/video.mp4`,
				allow_download: false,
				display_embed: true,
				poster: `https://videos.files.wordpress.com/${ guid }/video.jpg`,
				height: 270,
				width: 480,
				rating: 'G',
				is_private: !! isPrivate,
				...metadata,
			},
		},
		{
			request: {
				path: `/oembed/1.0/proxy?url=https%3A%2F%2Fvideopress.com%2Fv%2F${ guid }%3FresizeToParent%3Dtrue%26cover%3Dtrue%26preloadContent%3Dmetadata`,
			},
			response: {
				height: 338,
				provider_name: 'VideoPress',
				html: `<iframe title='VideoPress Video Player' width='600' height='338' src='https://video.wordpress.com/embed/${ guid }?cover=1&amp;preloadContent=metadata&amp;hd=1' frameborder='0' allowfullscreen data-resize-to-parent='true' allow='clipboard-write'></iframe>`,
				width: 600,
				type: 'video',
			},
		},
	];
};

/**
 * Generates the metadata of VideoPress video upload.
 * This should be used when notifying the upload succeed state.
 *
 * @param {string} guid VideoPress GUID.
 */
export const generateUploadMetadata = ( guid = VIDEOPRESS_GUID ) => ( {
	metadata: Platform.select( {
		android: { videopressGUID: guid },
		ios: { id: guid },
	} ),
} );

/**
 * Generates a remote media object.
 *
 * @param {number} id Media ID.
 */
export const generateRemoteMedia = ( id = 1 ) => ( {
	...generateLocalMedia( id ),
	serverId: id * 1000,
	serverUrl: `https://videopress.wordpress.com/local-video-${ id }.mp4`,
} );

/**
 * Generates a local media object.
 *
 * @param {number} id Media ID.
 */
export const generateLocalMedia = ( id = 1 ) => ( {
	type: 'video',
	localId: id,
	localUrl: `file:///local-video-${ id }.mp4`,
} );

/**
 * Generates a WordPress library media object.
 *
 * @param {Object} options
 * @param {string} [options.id]   Media ID.
 * @param {string} [options.guid] VideoPress GUID.
 */
export const generateLibraryMedia = ( {
	id = 1,
	guid = VIDEOPRESS_GUID,
} = {} ) => ( {
	type: 'video',
	id: id * 1000,
	url: `https://test.files.wordpress.com/local-video-${ id }.mp4`,
	metadata: {
		videopressGUID: guid,
	},
} );
