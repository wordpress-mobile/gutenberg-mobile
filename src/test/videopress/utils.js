/**
 * External dependencies
 */
import {
	initializeEditor,
	getBlock,
	fireEvent,
	openBlockSettings,
} from 'test/helpers';
/**
 * Internal dependencies
 */
import { VIDEOPRESS_BLOCK_HTML } from './constants';

export const initializeBlockWithHTML = async (
	initialHtml = VIDEOPRESS_BLOCK_HTML
) => {
	const screen = await initializeEditor( { initialHtml } );

	return { ...screen };
};

export const selectAndOpenBlockSettings = async ( screen ) => {
	const videoPressBlock = await getBlock( screen, 'VideoPress' );

	expect( videoPressBlock ).toBeVisible();

	await fireEvent.press( videoPressBlock );

	await openBlockSettings( screen );

	return { ...screen, videoPressBlock };
};

