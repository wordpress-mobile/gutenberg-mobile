/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import { initialHtmlGutenberg } from '@wordpress/react-native-editor';

/**
 * Internal dependencies
 */
import initialHtml from './initial-html';
import initAnalytics from './analytics';

const setupHooks = () => {
	// Hook triggered before the editor is rendered
	addAction( 'native.pre-render', 'gutenberg-mobile', () => {
		require( './strings-overrides' );
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

	// Hook to expand the supported endpoints of `api-fetch` library.
	addFilter(
		'native.supported_endpoints',
		'gutenberg-mobile',
		( endpoints ) => {
			return {
				...endpoints,
				GET: [
					...endpoints.GET,
					/rest\/v1.1\/videos.*/i,
					/wpcom\/v2\/videopress\/\w*\/check-ownership\/.*/i,
					/wpcom\/v2\/jetpack-ai\/ai-assistant-feature.*/i,
				],
				POST: [
					...endpoints.POST,
					/wpcom\/v2\/(media)\/.*/i,
					/wpcom\/v2\/videopress\/meta.*/i,
					// AI token endpoints
					/jetpack\/v4\/jetpack-ai-jwt\?.*/i,
					/wpcom\/v2\/jetpack-openai-query\/jwt\?.*/i,
				],
			};
		}
	);

	// Hook to expand the endpoints (of `api-fetch` library) that won't be cached on Android.
	addFilter(
		'native.disabled_caching_endpoints',
		'gutenberg-mobile',
		( endpoints ) => {
			return [ ...endpoints, /rest\/v1.1\/videos.*/i ];
		}
	);
};

export default () => {
	initAnalytics();
	setupHooks();
};
