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
	RATING_OPTIONS,
	PRIVACY_OPTIONS,
	ADDITIONAL_PRIVACY_AND_RATING_SETTINGS,
} from './constants';
import {
	initializeBlockWithHTML,
	selectAndOpenBlockSettings,
} from './utils';

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

		// Get block
		const videoPressBlock = await getBlock( screen, 'VideoPress' );
		expect( videoPressBlock ).toBeVisible();

		const expectedHtml = `<!-- wp:videopress/video /-->`;
		expect( getEditorHtml() ).toBe( expectedHtml );

		// Reset editor to avoid side effects from built-in timers in addBlock() function on iOS
		await initializeEditor();
	} );
} );

describe( "Update VideoPress block's settings", () => {
	let screen;

	beforeEach( async () => {
		// Arrange
		screen = await initializeBlockWithHTML();

		await selectAndOpenBlockSettings( screen );
	} );

	/*
	 * TITLE SETTING
	 * Select and get the title input field before changing text
	 */
	it( `should update title`, async () => {
		fireEvent.press( screen.getByText( 'Title' ) );

		const input = screen.getByDisplayValue( 'default-title-is-file-name' );

		changeTextOfTextInput( input, 'Hello world!' );
	} );

	afterEach( async () => {
		// Assert
		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
