/**
 * External dependencies
 */
import { NativeModules } from 'react-native';
import * as Sentry from '@sentry/react-native';

/**
 * Internal dependencies
 */
import AttachScope from './attach-scope-integration';

const { RNSentry } = NativeModules;

const IGNORED_DEFAULT_INTEGRATIONS = [
	'Release',
	'Breadcrumbs',
	'UserAgent',
	'DeviceContext',
];

export async function initialize() {
	// Get Sentry options from the main apps.
	const { dsn, environment, releaseName } = await RNSentry.getOptions();
	Sentry.init( {
		dsn,
		debug: __DEV__,
		environment,
		release: releaseName,
		dist: releaseName,
		beforeSend: async ( event ) => {
			const shouldSendEvent = await RNSentry.shouldSendEvent();
			if ( ! shouldSendEvent ) {
				return false;
			}
			return event;
		},
		integrations: ( items ) => {
			const filteredIntegrations = items.filter(
				( item ) => ! IGNORED_DEFAULT_INTEGRATIONS.includes( item.name )
			);
			// Breadcrumbs integration is required to enable breadcumbs in the event.
			// As the breadcrumbs will be set by the main apps, we disable all the tracking options.
			filteredIntegrations.push(
				new Sentry.BrowserIntegrations.Breadcrumbs( {
					console: false,
					dom: false,
					fetch: false,
					history: false,
					sentry: false,
					xhr: false,
				} )
			);
			filteredIntegrations.push( new AttachScope() );
			return filteredIntegrations;
		},
	} );
}
