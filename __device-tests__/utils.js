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
	const isPortrait = orientation === 'PORTRAIT';
	const statusBarHeightIPhone = isPortrait ? 94 : 0;
	const statusBarHeightIOS = iPadDevice ? 48 : statusBarHeightIPhone;
	const statusBarHeight = isAndroid() ? 100 : statusBarHeightIOS;
	const screenshot = await editorPage.driver.takeScreenshot();
	const portraitWidthSize = iPadDevice ? 768 : 320;
	const landscapeWidthSize = iPadDevice ? 1024 : 640;
	const widthSize = isPortrait ? portraitWidthSize : landscapeWidthSize;

	const base64Image = Buffer.from( screenshot, 'base64' );
	const image = await jimp.read( base64Image );

	// Remove keyboard (optional) to avoid issues like languages, keyboard position buttons, etc.
	if ( withoutKeyboard ) {
		const windowSize = await editorPage.driver.getWindowSize();
		const toolbarElement = await editorPage.getToolbar();

		if ( toolbarElement.length !== 0 ) {
			const toolbarSize = await toolbarElement.getSize();
			const toolbarLocation = await toolbarElement.getLocation();
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
