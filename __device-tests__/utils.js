/**
 * External dependencies
 */
import jimp from 'jimp';

const { isAndroid } = e2eUtils;

/**
 * Helper to take a screenshot and manipulate it.
 *
 * @param {Object}  options                    Options
 * @param {boolean} [options.withoutKeyboard]  Prevents showing the keyboard in the screenshot.
 * @param {number}  [options.heightPercentage] Specify a custom height in percentage.
 * @return {Buffer} Sreenshot image.
 */
export async function takeScreenshot(
	options = { withoutKeyboard: false, heightPercentage: undefined }
) {
	const { withoutKeyboard, heightPercentage } = options;
	const iPadDevice = process.env.IPAD;
	const orientation = await editorPage.driver.getOrientation();
	const statusBarHeightIOS = iPadDevice ? 48 : 94;
	const statusBarHeight = isAndroid() ? 100 : statusBarHeightIOS;
	const screenshot = await editorPage.driver.takeScreenshot();
	const portraitWidthSize = iPadDevice ? 768 : 320;
	const landscapeWidthSize = iPadDevice ? 1024 : 640;
	const widthSize =
		orientation === 'PORTRAIT' ? portraitWidthSize : landscapeWidthSize;

	const base64Image = Buffer.from( screenshot, 'base64' );
	const image = await jimp.read( base64Image );

	// Remove keyboard (optional) to avoid issues like languages, keyboard position buttons, etc.
	if ( withoutKeyboard ) {
		const windowSize = await editorPage.driver.getWindowSize();
		const toolbarElement = await editorPage.getToolbar();

		if ( toolbarElement.length !== 0 ) {
			const toolbarSize = await toolbarElement[ 0 ].getSize();
			const toolbarLocation = await toolbarElement[ 0 ].getLocation();
			const offset =
				windowSize.height - ( toolbarLocation.y + toolbarSize.height );
			const imageHeight = isAndroid()
				? windowSize.height
				: image.getHeight();
			const newHeight = ( imageHeight * offset ) / windowSize.height;

			image.crop( 0, 0, image.getWidth(), imageHeight - newHeight );
		}
	}

	// Custom height in percentage
	if ( heightPercentage ) {
		const height = ( heightPercentage * image.getHeight() ) / 100;
		image.crop( 0, 0, image.getWidth(), height );
	}

	// Remove status bar
	image.crop(
		0,
		statusBarHeight,
		image.getWidth(),
		image.getHeight() - statusBarHeight
	);

	const resizedImage = await image.resize( widthSize, jimp.AUTO );
	return resizedImage.getBufferAsync( jimp.MIME_PNG );
}

/**
 * Generates the appropriate URL to fetch the theme data based on the provided theme details.
 *
 * @param {Object}  theme                  Object containing details about the theme.
 * @param {string}  theme.name             The name of the theme.
 * @param {boolean} theme.isWordPressTheme Flag indicating whether the theme is a WordPress theme. Defaults to false.
 * @return {string} The URL from which the theme data can be fetched.
 */
function getThemeLink( { name, isWordPressTheme = false } ) {
	if ( isWordPressTheme ) {
		return `https://raw.githubusercontent.com/WordPress/${ name }/trunk/theme.json`;
	}

	return `https://raw.githubusercontent.com/Automattic/themes/trunk/${ name }/theme.json`;
}

/**
 * Fetches and processes the theme data from the provided theme details.
 *
 * @param {Object}  theme                  Object containing details about the theme.
 * @param {string}  theme.name             The name of the theme.
 * @param {boolean} theme.isWordPressTheme Flag indicating whether the theme is a WordPress theme. Defaults to false.
 * @return {Promise<string>} A promise that resolves to a stringified JSON object containing the theme data.
 * @throws Will throw an error if the fetch operation fails.
 */
export async function fetchTheme( theme ) {
	const themeJSONLink = getThemeLink( theme );

	return await fetch( themeJSONLink )
		.then( ( response ) => response.json() )
		.then( ( data ) => JSON.stringify( data ) );
}
