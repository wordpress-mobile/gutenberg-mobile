/**
 * External dependencies
 */
import { addGlobalEventProcessor, getCurrentHub } from '@sentry/react-native';
import { NativeModules } from 'react-native';

const { RNSentry } = NativeModules;

export default class AttachScope {
	constructor() {
		this.name = AttachScope.id;
	}

	setupOnce() {
		addGlobalEventProcessor( async ( event ) => {
			const self = getCurrentHub().getIntegration( AttachScope );
			if ( ! self ) {
				return event;
			}
			try {
				// The scope from the native side is attached to the event.
				event = await RNSentry.attachScopeToEvent( event );
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.error( `Failed to attach scope from native: ${ e }` );
			}
			return event;
		} );
	}
}
AttachScope.id = 'AttachScope';
