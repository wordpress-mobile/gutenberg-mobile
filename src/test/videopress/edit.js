/**
 * External dependencies
 */
import {
	getEditorHtml,
	initializeEditor,
	addBlock,
	getBlock,
	setupCoreBlocks,
	fireEvent,
	changeTextOfTextInput,
	withFakeTimers,
	act,
	within,
	typeInRichText,
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
	DEFAULT_PROPS,
	PLAYBACK_SETTINGS,
	PLAYBACK_BAR_COLOR_SETTINGS,
	RATING_OPTIONS,
	PRIVACY_OPTIONS,
	ADDITIONAL_PRIVACY_AND_RATING_SETTINGS,
} from './local-helpers/constants';
import {
	selectAndOpenBlockSettings,
	pressSettingInPanel,
	pressSettingInPicker,
	generateFetchMocks,
	generateBlockHTML,
} from './local-helpers/utils';

const VIDEO_TITLE = 'default-title-is-file-name';
const FETCH_MOCKS_METADATA = {
	title: VIDEO_TITLE,
	description: '',
};

setupCoreBlocks();

beforeAll( () => {
	// Register Jetpack blocks
	setupJetpackEditor( {
		blogId: 1,
		isJetpackActive: true,
	} );
	registerJetpackBlocks( DEFAULT_PROPS );
} );

describe( 'VideoPress block', () => {
	beforeAll( () => {
		// Mock request reponses
		setupApiFetch(
			generateFetchMocks( { metadata: FETCH_MOCKS_METADATA } )
		);
	} );

	it( 'should successfully insert the VideoPress block into the editor', async () => {
		const screen = await initializeEditor();

		// Add block
		await addBlock( screen, 'VideoPress' );

		// When the block is inserted, it automatically opens the media picker.
		// On iOS, this picker is displayed using a timer, so we need to run it
		// to allow any DOM update.
		await withFakeTimers( () => jest.runOnlyPendingTimers() );

		// Get block
		const videoPressBlock = await getBlock( screen, 'VideoPress' );
		expect( videoPressBlock ).toBeVisible();

    const expectedHtml = `<!-- wp:videopress/video/hack/for/ci/failure /-->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );

	it( 'sets caption', async () => {
		const screen = await initializeEditor( {
			initialHtml: generateBlockHTML(),
		} );
		const { getByLabelText } = screen;

		// Select block
		const videoPressBlock = await getBlock( screen, 'VideoPress' );
		expect( videoPressBlock ).toBeVisible();
		fireEvent.press( videoPressBlock );

		// Set caption
		const captionField = within(
			getByLabelText( /Video caption. Empty/ )
		).getByPlaceholderText( 'Add caption' );
		typeInRichText(
			captionField,
			'<strong>Bold</strong> <em>italic</em> <s>strikethrough</s> VideoPress caption'
		);

		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );

describe( "Update VideoPress block's settings", () => {
	let screen;

	beforeAll( () => {
		// Mock request reponses
		setupApiFetch(
			generateFetchMocks( {
				isSitePrivate: true,
				metadata: FETCH_MOCKS_METADATA,
			} )
		);
	} );

	beforeEach( async () => {
		// Arrange
		screen = await initializeEditor( {
			initialHtml: generateBlockHTML( {
				title: VIDEO_TITLE,
				description: '',
				isSitePrivate: true,
			} ),
		} );
	} );

	/*
	 * TITLE SETTING
	 * Select and get the title input field before changing text
	 */
	it( `should update title`, async () => {
		await selectAndOpenBlockSettings( screen );

		fireEvent.press( screen.getByText( 'Title' ) );

		const input = screen.getByDisplayValue( VIDEO_TITLE );

		changeTextOfTextInput( input, 'Hello world!' );
	} );

	/*
	 * DESCRIPTION SETTING
	 * Select and get the description input field before changing text
	 */
	it( `should update description`, async () => {
		await selectAndOpenBlockSettings( screen );

		fireEvent.press( screen.getByText( 'Description' ) );

		const input = screen.getByPlaceholderText( 'Add description' );

		changeTextOfTextInput( input, "The video's new description!" );
	} );

	/*
	 * PLAYBACK SETTINGS
	 * Loop through each of the playback settings and toggle on/off
	 */
	PLAYBACK_SETTINGS.forEach( ( setting ) => {
		it( `should update Playback Settings section's ${ setting } setting`, async () => {
			await selectAndOpenBlockSettings( screen );
			await pressSettingInPanel( screen, 'Playback Settings', setting );
		} );
	} );

	/*
	 * PLAYBACK BAR COLOR SETTINGS
	 * Loop through each of the playback bar color settings and, if applicable, select a color
	 */
	PLAYBACK_BAR_COLOR_SETTINGS.forEach( ( { setting, color }, index ) => {
		it( `should update Playback Bar Color section's ${ setting } setting${
			color ? ` to ${ color }` : ''
		}`, async () => {
			// Fake timers are set before the `ColorPanel` is mounted to ensure that timers are mocked.
			await withFakeTimers( async () => {
				await selectAndOpenBlockSettings( screen );
				await pressSettingInPanel(
					screen,
					'Playback Bar Color',
					setting
				);
				// TODO(jest-console): Fix the warning and remove the expect below.
				if ( index === 1 ) {
					expect( console ).toHaveWarned();
				}

				if ( color ) {
					// Select color
					await fireEvent.press( screen.getByLabelText( color ) );

					// `setColor()` in `ColorPanel` component uses a debounced function delaying attribute
					// updates. It's necessary to account for this delay here. Ref: https://bit.ly/3MrEgKT
					await act( () => jest.runOnlyPendingTimers() );
				}
			} );
		} );
	} );

	/*
	 * RATING SETTINGS
	 * Loop through each of the possible ratings and select each one
	 */
	RATING_OPTIONS.forEach( ( option, index ) => {
		// Skip the default setting, as it is already selected
		if ( index === 0 ) return;

		it( `should update Privacy and Rating section's rating setting to ${ option }`, async () => {
			await selectAndOpenBlockSettings( screen );
			await pressSettingInPicker(
				screen,
				'Privacy and Rating',
				'Rating',
				RATING_OPTIONS,
				option
			);
		} );
	} );

	/*
	 * PRIVACY SETTINGS
	 * Loop through each of the possible privacy options and select each one
	 */
	PRIVACY_OPTIONS.forEach( ( option, index ) => {
		// Skip the default setting, as it is already selected
		if ( index === 0 ) return;

		it( `should update Privacy and Rating section's privacy setting to ${ option }`, async () => {
			await selectAndOpenBlockSettings( screen );
			await pressSettingInPicker(
				screen,
				'Privacy and Rating',
				'Privacy',
				PRIVACY_OPTIONS,
				option
			);
		} );
	} );

	/*
	 * PRIVACY AND RATING SETTINGS
	 * Loop through the additional Privacy and Rating settings and toggle on/off
	 */
	ADDITIONAL_PRIVACY_AND_RATING_SETTINGS.forEach( ( setting ) => {
		it( `should update Privacy and Rating section's ${ setting }`, async () => {
			await selectAndOpenBlockSettings( screen );
			await pressSettingInPanel( screen, 'Privacy and Rating', setting );
		} );
	} );

	afterEach( async () => {
		// Assert
		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
