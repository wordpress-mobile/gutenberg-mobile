/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import {
	doGutenbergNativeSetup,
	initialHtmlGutenberg,
} from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import {
	registerJetpackBlocks,
	registerJetpackEmbedVariations,
	setupJetpackEditor,
} from './jetpack-editor-setup';
import setupBlockExperiments from './block-experiments-setup';
import initialHtml from './initial-html';
import initAnalytics from './analytics';

addAction( 'native.pre-render', 'gutenberg-mobile', ( props ) => {
	require( './strings-overrides' );
	correctTextFontWeight();

	setupJetpackEditor(
		props.jetpackState || { blogId: 1, isJetpackActive: true }
	);

	// Jetpack Embed variations use WP hooks that are attached to
	// block type registration, so it’s required to add them before
	// the core blocks are registered.
	registerJetpackEmbedVariations( props );
} );

addAction( 'native.render', 'gutenberg-mobile', ( props ) => {
	const capabilities = props.capabilities ?? {};
	registerJetpackBlocks( props );
	setupBlockExperiments( capabilities );
} );

addFilter( 'native.block_editor_props', 'gutenberg-mobile', ( editorProps ) => {
	if ( __DEV__ ) {
		let { initialTitle, initialData } = editorProps;

		if ( initialTitle === undefined ) {
			initialTitle = 'Welcome to gutenberg for WP Apps!';
		}

		if ( initialData === undefined ) {
			initialData = initialHtml + initialHtmlGutenberg;
		}

		return {
			...editorProps,
			initialTitle,
			initialData,
		};
	}
	return editorProps;
} );

initAnalytics();
doGutenbergNativeSetup();
