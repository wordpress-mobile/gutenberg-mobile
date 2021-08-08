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
import setupAllowedBlocks from './allowed-blocks-setup';
import setupBlockExperiments from './block-experiments-setup';
import setupJetpackEditor from './jetpack-editor-setup';
import initialHtml from './initial-html';

addAction( 'native.pre-render', 'gutenberg-mobile', () => {
	require( './strings-overrides' );
	correctTextFontWeight();
} );

addAction( 'native.render', 'gutenberg-mobile', ( props ) => {
	const capabilities = props.capabilities ?? {};
	setupJetpackEditor( props );
	setupBlockExperiments( capabilities );
	setupAllowedBlocks( props );
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

doGutenbergNativeSetup();
