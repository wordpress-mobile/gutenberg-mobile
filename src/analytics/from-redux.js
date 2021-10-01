/**
 * WordPress dependencies
 */
import { use } from '@wordpress/data';

/**
 * Internal dependencies
 */
import eventTrackers from './trackers';
import { REDUX_TRACKING } from './events';

/**
 * Initialize the Redux middleware
 */
export default function() {
	use( ( registry ) => ( {
		dispatch: ( namespace ) => {
			const namespaceName =
				typeof namespace === 'object' ? namespace.name : namespace;
			const actions = { ...registry.dispatch( namespaceName ) };
			const trackedEvents = REDUX_TRACKING[ namespaceName ];

			if ( trackedEvents ) {
				trackedEvents.forEach( ( actionName ) => {
					const originalAction = actions[ actionName ];
					const tracker = eventTrackers[ actionName ] || ( () => {} );
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
