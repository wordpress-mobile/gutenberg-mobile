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
	VIDEOPRESS_BLOCK_HTML,
	PLAYBACK_SETTINGS,
	PLAYBACK_BAR_COLOR_SETTINGS,
	ADDITIONAL_PRIVACY_AND_RATING_SETTINGS,
} from './local-helpers/constants';
import {
	selectAndOpenBlockSettings,
	pressSettingInPanel,
} from './local-helpers/utils';

setupCoreBlocks();

beforeAll( () => {
	// Register Jetpack blocks
	setupJetpackEditor( { blogId: 1, isJetpackActive: true } );
	registerJetpackBlocks( DEFAULT_PROPS );
} );

describe( 'VideoPress block', () => {
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

		const expectedHtml = `<!-- wp:videopress/video /-->`;
		expect( getEditorHtml() ).toBe( expectedHtml );
	} );
} );

describe( "Update VideoPress block's settings", () => {
	let screen;

	beforeEach( async () => {
		// Arrange
		screen = await initializeEditor( {
			initialHtml: VIDEOPRESS_BLOCK_HTML,
		} );
	} );

	/*
	 * TITLE SETTING
	 * Select and get the title input field before changing text
	 */
	it( `should update title`, async () => {
		await selectAndOpenBlockSettings( screen );

		fireEvent.press( screen.getByText( 'Title' ) );

		const input = screen.getByDisplayValue( 'default-title-is-file-name' );

		changeTextOfTextInput( input, 'Hello world!' );
	} );

	/*
	 * DESCRIPTION SETTING
	 * Select and get the description input field before changing text
	 */
	it( `should update description`, async () => {
		await selectAndOpenBlockSettings( screen );

		fireEvent.press( screen.getByText( 'Description' ) );

		const allDescriptionInputs = screen.getAllByPlaceholderText(
			'Add description'
		);

		// The BottomSheetControl's input field is accessed via the component's second placeholder
		const input = allDescriptionInputs[ 1 ];

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
	 * Loop through each of the playback bar color setting
	 * TODO: Select color options (if applicable)
	 */
	PLAYBACK_BAR_COLOR_SETTINGS.forEach( ( setting ) => {
		it( `should update Playback Bar Color section's ${ setting } setting`, async () => {
			await selectAndOpenBlockSettings( screen );
			await pressSettingInPanel( screen, 'Playback Bar Color', setting );
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
