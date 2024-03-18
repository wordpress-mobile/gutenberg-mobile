/**
 * WordPress dependencies
 */
import { logException } from '@wordpress/react-native-bridge';

// Setting Error handler to send exceptions. This implementation is based on Sentry React Native SDK:
// https://github.com/getsentry/sentry-react-native/blob/adfb66f16438dfd98f280307844778c7291b584b/src/js/integrations/reactnativeerrorhandlers.ts#L187-L262
export default () => {
	const errorUtils = global.ErrorUtils;
	const defaultHandler =
		errorUtils.getGlobalHandler && errorUtils.getGlobalHandler();

	let handlingFatal = false;
	errorUtils.setGlobalHandler( ( error, isFatal ) => {
		// For now, only fatal errors are logged
		if ( ! isFatal ) {
			defaultHandler( error, isFatal );
			return;
		}

		// On production, we only allow logging a single fatal error.
		// This prevents sending extra exceptions derived from the original error.
		if ( ! __DEV__ ) {
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

		logException(
			error,
			{ isHandled: false, handledBy: 'Global Error Handler' },
			() => {
				// Wait for the exception to be sent to host app
				defaultHandler( error, isFatal );
			}
		);
	} );
};
