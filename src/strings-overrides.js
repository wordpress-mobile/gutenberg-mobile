/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

addFilter(
	'native.missing_block_detail',
	'native/missing_block',
	( defaultValue ) => {
		const { getSettings } = select( 'core/block-editor' );
		const isUnsupportedBlockEditorSupported =
			getSettings( 'capabilities' ).unsupportedBlockEditor === true;
		const canEnableUnsupportedBlockEditor =
			getSettings( 'capabilities' ).canEnableUnsupportedBlockEditor ===
			true;

		const unsupportedBlocksExplanation = __(
			'You can edit this block using the web version of the editor.'
		);

		if (
			isUnsupportedBlockEditorSupported === false &&
			canEnableUnsupportedBlockEditor
		) {
			const note = __(
				'Note: You must allow WordPress.com login to edit this block in the mobile editor.'
			);
			return unsupportedBlocksExplanation + '\n\n' + note; // Translations can not have characters like '\n', so we add the new lines manually.
		} else if ( isUnsupportedBlockEditorSupported ) {
			return unsupportedBlocksExplanation;
		}

		return defaultValue;
	}
);

addFilter(
	'native.missing_block_action_button',
	'native/missing_block',
	( defaultValue ) => {
		const { getSettings } = select( 'core/block-editor' );
		const isUnsupportedBlockEditorSupported =
			getSettings( 'capabilities' ).unsupportedBlockEditor === true;
		const canEnableUnsupportedBlockEditor =
			getSettings( 'capabilities' ).canEnableUnsupportedBlockEditor ===
			true;

		const shouldOverwriteButtonTitle =
			isUnsupportedBlockEditorSupported === false &&
			canEnableUnsupportedBlockEditor;

		return shouldOverwriteButtonTitle
			? __( 'Open Jetpack Security settings' )
			: defaultValue;
	}
);
