/**
 * External dependencies
 */
import jimp from 'jimp';

const { isAndroid } = e2eUtils;

export async function takeScreenshot() {
	const orientation = await editorPage.driver.getOrientation();
	const statusBarHeight = isAndroid() ? 100 : 94;
	const screenshot = await editorPage.driver.takeScreenshot();
	const widthSize = orientation === 'PORTRAIT' ? 320 : 640;

	const base64Image = Buffer.from( screenshot, 'base64' );
	const image = await jimp.read( base64Image );
	image.crop(
		0,
		statusBarHeight,
		image.getWidth(),
		image.getHeight() - statusBarHeight
	);
	const resizedImage = await image.resize( widthSize, jimp.AUTO );
	return resizedImage.getBufferAsync( jimp.MIME_PNG );
}
