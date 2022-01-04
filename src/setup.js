/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import { initialHtmlGutenberg } from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import correctTextFontWeight from './text-font-weight-correct';
import initialHtml from './initial-html';
import initAnalytics from './analytics';

const setupHooks = () => {
	// Hook triggered before the editor is rendered
	addAction( 'native.pre-render', 'gutenberg-mobile', () => {
		require( './strings-overrides' );
		correctTextFontWeight();
	} );

	addFilter(
		'native.block_editor_props',
		'gutenberg-mobile',
		( editorProps ) => {
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
		}
	);
};

export default () => {
	initAnalytics();
	setupHooks();
};
