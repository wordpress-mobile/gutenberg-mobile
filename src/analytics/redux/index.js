/**
 * WordPress dependencies
 */
import { use } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { trackedEvents } from './tracked_events';

/**
 * Initialize the Redux middleware
 */
export function initialize() {
	use( ( registry ) => ( {
		dispatch: ( namespace ) => {
			const namespaceName =
				typeof namespace === 'object' ? namespace.name : namespace;
			const actions = { ...registry.dispatch( namespaceName ) };
			const trackers = trackedEvents[ namespaceName ];

			if ( trackers ) {
				Object.keys( trackers ).forEach( ( actionName ) => {
					const originalAction = actions[ actionName ];
					const tracker = trackers[ actionName ];
					actions[ actionName ] = ( ...args ) => {
						try {
							tracker( ...args );
						} catch ( err ) {
							// eslint-disable-next-line no-console
							console.error( err );
						}
						return originalAction( ...args );
					};
				} );
			}

			return actions;
		},
	} ) );
}
