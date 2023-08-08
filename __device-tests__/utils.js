/**
 * External dependencies
 */
import jimp from 'jimp';

const { isAndroid } = e2eUtils;

/**
 * Helper to take a screenshot of an element.
 *
 * @param {*}      element           Element instance.
 * @param {Object} options           Options
 * @param {number} [options.padding] Padding offset to apply to the screenshot.
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
		// The padding value is in pixels, so we need to convert
		// it to device coordinates.
		padding *= pixelRatio;

		crop.x -= padding;
		crop.y -= padding;
		crop.width += padding * 2;
		crop.height += padding * 2;
	}
	return takeScreenshot( { crop } );
}

/**
 * Helper to take a screenshot and manipulate it.
 *
 * @param {Object}  options                    Options
 * @param {boolean} [options.withoutKeyboard]  Prevents showing the keyboard in the screenshot.
 * @param {number}  [options.heightPercentage] Specify a custom height in percentage.
 * @param {Object}  [options.crop]             Specify values to crop the screenshot.
 * @param {number}  [options.offset.x]         X offset to crop.
 * @param {number}  [options.offset.y]         Y offset to crop.
 * @param {number}  [options.offset.width]     Width offset to crop.
 * @param {number}  [options.offset.height]    Height offset to crop.
 * @return {Buffer} Sreenshot image.
 */
export async function takeScreenshot(
	options = {
		withoutKeyboard: false,
		heightPercentage: undefined,
		crop: undefined,
	}
) {
	const iPadDevice = process.env.IPAD;
	const { withoutKeyboard, heightPercentage, crop } = options;
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

	// Custom height in percentage
	if ( heightPercentage ) {
		finalSize.height = Math.min(
			finalSize.height,
			( heightPercentage * imageHeight ) / 100
		);
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
