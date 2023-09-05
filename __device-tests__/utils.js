/**
 * External dependencies
 */
import jimp from 'jimp';

const { isAndroid } = e2eUtils;

/**
 * Helper to take a screenshot of an element.
 *
 * @typedef {Object} PaddingScreenshot
 *
 * @property {number}                     top               Padding to apply to the top side, in pixels.
 * @property {number}                     right             Padding to apply to the right side, in pixels.
 * @property {number}                     bottom            Padding to apply to the bottom side, in pixels.
 * @property {number}                     left              Padding to apply to the left side, in pixels.
 *
 * @param    {*}                          element           Element instance.
 * @param    {Object}                     options           Options
 * @param    {number | PaddingScreenshot} [options.padding] Padding offset to apply to the screenshot. It accepts negative values.
 * @return {Buffer} Sreenshot image.
 */
export async function takeScreenshotByElement( element, { padding } = {} ) {
	const sessionCapabilities = await editorPage.driver.sessionCapabilities();
	const { pixelRatio } = sessionCapabilities;

	const location = await element.getLocation();
	const size = await element.getSize();
	const crop = {
		x: location.x,
		y: location.y,
		width: size.width,
		height: size.height,
	};
	// Location and size value are in pixels on iOS, we need to
	// convert them to device coordinates.
	if ( ! isAndroid() ) {
		crop.x *= pixelRatio;
		crop.y *= pixelRatio;
		crop.width *= pixelRatio;
		crop.height *= pixelRatio;
	}

	if ( padding ) {
		if ( typeof padding === 'object' ) {
			let { top = 0, right = 0, bottom = 0, left = 0 } = padding;
			// The padding value is in pixels, so we need to convert
			// it to device coordinates.
			top *= pixelRatio;
			right *= pixelRatio;
			bottom *= pixelRatio;
			left *= pixelRatio;

			crop.x -= left;
			crop.y -= top;
			crop.width += left + right;
			crop.height += top + bottom;
		} else if ( Number.isInteger( padding ) ) {
			// The padding value is in pixels, so we need to convert
			// it to device coordinates.
			padding *= pixelRatio;

			crop.x -= padding;
			crop.y -= padding;
			crop.width += padding * 2;
			crop.height += padding * 2;
		} else {
			throw new Error(
				'Padding argument needs to be a number or object.'
			);
		}
	}

	return takeScreenshot( { crop } );
}

/**
 * Helper to take a screenshot and manipulate it.
 *
 * @typedef {Object} CropScreenshot
 *
 * @property {number}         x                         X offset, in pixels.
 * @property {number}         y                         Y offset, in pixels.
 * @property {number}         width                     Width, in pixels.
 * @property {number}         height                    Height, in pixels.
 *
 * @param    {Object}         options                   Options
 * @param    {boolean}        [options.withoutKeyboard] Prevents showing the keyboard in the screenshot.
 * @param    {CropScreenshot} [options.crop]            Specify values to crop the screenshot.
 * @return {Buffer} Sreenshot image.
 */
export async function takeScreenshot( { withoutKeyboard, crop } = {} ) {
	const iPadDevice = process.env.IPAD;
	const sessionCapabilities = await editorPage.driver.sessionCapabilities();
	const { pixelRatio } = sessionCapabilities;

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

	const imageWidth = image.getWidth();
	const imageHeight = image.getHeight();

	// We use this variable to store the final image size after applying cropping actions
	const finalSize = {
		x: crop?.x ?? 0,
		y: crop?.y ?? 0,
		width: crop?.width ?? imageWidth,
		height: crop?.height ?? imageHeight,
	};

	// Remove the status bar
	if ( finalSize.y < statusBarHeight ) {
		const statusBarOffset = statusBarHeight - finalSize.y;
		finalSize.y += statusBarOffset;
		finalSize.height -= statusBarOffset;
	}

	// Remove keyboard (optional) to avoid issues like languages, keyboard position buttons, etc.
	if ( withoutKeyboard ) {
		const toolbarElement = await editorPage.getToolbar();

		if ( toolbarElement.length !== 0 ) {
			const toolbarLocation = await toolbarElement.getLocation();
			const toolbarSize = await toolbarElement.getSize();
			// Location and size value are in pixels on iOS, we need to
			// convert them to device coordinates.
			if ( ! isAndroid() ) {
				toolbarLocation.y *= pixelRatio;
				toolbarSize.height *= pixelRatio;
			}

			finalSize.height = Math.min(
				finalSize.height,
				toolbarLocation.y + toolbarSize.height - statusBarHeight
			);
		}
	}

	// Crop image
	image.crop(
		Math.max( 0, finalSize.x ),
		Math.max( 0, finalSize.y ),
		Math.min( imageWidth, finalSize.width ),
		Math.min( imageHeight, finalSize.height )
	);

	const resizedImage = await image.resize( widthSize, jimp.AUTO );
	return resizedImage.getBufferAsync( jimp.MIME_PNG );
}
