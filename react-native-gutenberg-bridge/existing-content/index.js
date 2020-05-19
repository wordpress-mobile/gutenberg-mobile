/** @format */

/**
 * External dependencies
 */
import { NativeModules } from 'react-native';

const { RNReactNativeGutenbergBridge: {
	requestLinkToExistingContent: requestLink,
} } = NativeModules;

export function requestLinkToExistingContent( { currentUrl, callback } ) {
	requestLink( currentUrl, callback );
}
