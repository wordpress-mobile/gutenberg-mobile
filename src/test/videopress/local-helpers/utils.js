/**
 * External dependencies
 */
import { act, getBlock, fireEvent, openBlockSettings } from 'test/helpers';

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

	// Select the specified setting to trigger picker
	const pickerButtonPressed = async () => {
		fireEvent.press( getByText( setting ) );
	};

	// Setup the picker and select option
	const { selectOption } = setupPicker(
		screen,
		options,
		pickerButtonPressed
	);

	await selectOption( option );
};
