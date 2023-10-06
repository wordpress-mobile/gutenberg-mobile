/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { store as blockEditorStore } from '@wordpress/block-editor';

addFilter(
	'native.missing_block_detail',
	'native/missing_block',
	( defaultValue ) => {
		const { capabilities } = select( blockEditorStore ).getSettings();
		const isUnsupportedBlockEditorSupported =
			capabilities?.unsupportedBlockEditor === true;
		const canEnableUnsupportedBlockEditor =
			capabilities?.canEnableUnsupportedBlockEditor === true;

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

// Add extra note to `UnsupportedBlockDetails` description to explain how to enable UBE, in case
// it's available but disabled due to Jetpack settings.
addFilter(
	'native.unsupported_block_details_extra_note',
	'native/unsupported_block_details',
	( defaultValue ) => {
		const { capabilities } = select( blockEditorStore ).getSettings();
		const isUnsupportedBlockEditorSupported =
			capabilities?.unsupportedBlockEditor === true;
		const canEnableUnsupportedBlockEditor =
			capabilities?.canEnableUnsupportedBlockEditor === true;

		if (
			isUnsupportedBlockEditorSupported === false &&
			canEnableUnsupportedBlockEditor
		) {
			const note = __(
				'Note: You must allow WordPress.com login to edit this block in the mobile editor.'
			);
			return defaultValue ? defaultValue + '\n\n' + note : note; // Translations can not have characters like '\n', so we add the new lines manually.
		}
		return defaultValue;
	}
);

// Replace label of web editor action in `UnsupportedBlockDetails`, this is conditioned to the case
// when UBE can't be used until the user changes Jetpack settings.
addFilter(
	'native.unsupported_block_details_web_editor_action',
	'native/unsupported_block_details',
	( defaultValue ) => {
		const { capabilities } = select( blockEditorStore ).getSettings();
		const isUnsupportedBlockEditorSupported =
			capabilities?.unsupportedBlockEditor === true;
		const canEnableUnsupportedBlockEditor =
			capabilities?.canEnableUnsupportedBlockEditor === true;

		const shouldOverwriteButtonTitle =
			isUnsupportedBlockEditorSupported === false &&
			canEnableUnsupportedBlockEditor;

		return shouldOverwriteButtonTitle
			? __( 'Open Jetpack Security settings' )
			: defaultValue;
	}
);
