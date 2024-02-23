/**
 * WordPress dependencies
 */
import { logException } from '@wordpress/react-native-bridge';

// Setting Error handler to send exception. This implemenetation is based on Sentry React Native SDK:
// https://github.com/getsentry/sentry-react-native/blob/adfb66f16438dfd98f280307844778c7291b584b/src/js/integrations/reactnativeerrorhandlers.ts#L187-L262
export default () => {
	const errorUtils = global.ErrorUtils;
	const defaultHandler =
		errorUtils.getGlobalHandler && errorUtils.getGlobalHandler();

	let handlingFatal = false;
	errorUtils.setGlobalHandler( ( error, isFatal ) => {
		// We want to handle fatals, but only in production mode.
		const shouldHandleFatal = isFatal && ! __DEV__;
		if ( shouldHandleFatal ) {
			if ( handlingFatal ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Encountered multiple fatals in a row. The latest:',
					error
				);
				return;
			}
			handlingFatal = true;
		}

		// TODO: Set severity and exception mechanism.
		// https://github.com/getsentry/sentry-react-native/blob/adfb66f16438dfd98f280307844778c7291b584b/src/js/integrations/reactnativeerrorhandlers.ts#L235-L239

		logException( error, {}, () => {
			// Wait for the exception to be sent to host app.
			defaultHandler( error, isFatal );
		} );
	} );
};
