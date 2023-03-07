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
	const orientation = await editorPage.driver.getOrientation();
	const statusBarHeight = isAndroid() ? 100 : 94;
	const screenshot = await editorPage.driver.takeScreenshot();
	const widthSize = orientation === 'PORTRAIT' ? 320 : 640;

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
