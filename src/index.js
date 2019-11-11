/**
 * External dependencies
 *
 * @format
 */

/**
 * External dependencies
 */
import { AppRegistry, I18nManager } from 'react-native';
import React from 'react';

/**
 * WordPress dependencies
 */
import { setLocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './globals';
import { getTranslation } from '../i18n-cache';
import initialHtml from './initial-html';

const gutenbergSetup = () => {
	const wpData = require( '@wordpress/data' );

	// wp-data
	const userId = 1;
	const storageKey = 'WP_DATA_USER_' + userId;
	wpData.use( wpData.plugins.persistence, { storageKey } );
};

const setupLocale = ( locale, extraTranslations ) => {
	I18nManager.forceRTL( false ); // Change to `true` to debug RTL layout easily.

	let gutenbergTranslations = getTranslation( locale );
	if ( locale && ! gutenbergTranslations ) {
		// Try stripping out the regional
		locale = locale.replace( /[-_][A-Za-z]+$/, '' );
		gutenbergTranslations = getTranslation( locale );
	}
	const translations = Object.assign( {}, gutenbergTranslations, extraTranslations );
	// eslint-disable-next-line no-console
	console.log( 'locale', locale, translations );
	// Only change the locale if it's supported by gutenberg
	if ( gutenbergTranslations || extraTranslations ) {
		setLocaleData( translations );
	}
};

export class RootComponent extends React.Component {
	constructor( props ) {
		super( props );
		setupLocale( props.locale, props.translations );
		require( '@wordpress/edit-post' ).initializeEditor();
	}

	render() {
		const {
			initialHtmlModeEnabled,
			initialData = __DEV__ && initialHtml,
			initialTitle = 'Welcome to Gutenberg!',
			postType = 'post',
		} = this.props;
		const Editor = require( '@wordpress/edit-post' ).Editor;
		return (
			<Editor
				initialHtml={ initialData }
				initialHtmlModeEnabled={ initialHtmlModeEnabled }
				initialTitle={ initialTitle }
				postType={ postType }
			/>
		);
	}
}

export function registerApp() {
	// Disable warnings as they disrupt the user experience in dev mode
	// eslint-disable-next-line no-console
	console.disableYellowBox = true;

	gutenbergSetup();

	AppRegistry.registerComponent( 'gutenberg', () => RootComponent );
}
