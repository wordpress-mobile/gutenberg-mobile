/**
 * WordPress dependencies
 */
import { addStrings } from '@wordpress/components';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

export const uiStrings = () => {
	const { getSettings } = select( 'core/block-editor' );
	const unsupportedBlockEditor = {
		supported:
			getSettings( 'capabilities' ).unsupportedBlockEditor === true,
		switchable:
			getSettings( 'capabilities' ).unsupportedBlockEditorSwitch === true,
	};

	let unsupportedBlocksExplanation;

	if (
		unsupportedBlockEditor.supported === false &&
		unsupportedBlockEditor.switchable
	) {
		unsupportedBlocksExplanation = __(
			'You can edit this block using the web version of the editor.'
		);
		const note = __(
			'Note: You must allow WordPress.com login to edit this block in the mobile editor.'
		);
		unsupportedBlocksExplanation =
			unsupportedBlocksExplanation + '\n\n' + note; // Translations can not have characters like '\n', so we add the new lines manually.
	} else if ( unsupportedBlockEditor.supported === true ) {
		unsupportedBlocksExplanation = __(
			'You can edit this block using the web version of the editor.'
		);
	} else {
		unsupportedBlocksExplanation = undefined; // Show default text.
	}

	const shouldOverwriteButtonTitle =
		unsupportedBlockEditor.supported === false &&
		unsupportedBlockEditor.switchable;
	const unsupportedBlocksButton = shouldOverwriteButtonTitle
		? __( 'Open Jetpack Seccurity settings' )
		: undefined;

	return {
		'missing-block-detail': unsupportedBlocksExplanation,
		'missing-block-action-button': unsupportedBlocksButton,
	};
};

addStrings( uiStrings );
