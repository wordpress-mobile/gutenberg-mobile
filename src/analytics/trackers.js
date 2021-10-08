/* eslint-disable camelcase */
/**
 * WordPress dependencies
 */
import { sendEventToHost } from '@wordpress/react-native-bridge';

/**
 * Internal dependencies
 */
import * as EVENTS from './events';

export default {
	// Track block insertion
	[ EVENTS.INSERT_BLOCK ]( eventData ) {
		const { name: block_name } = eventData;
		sendEventToHost( EVENTS.INSERT_BLOCK, { block_name } );
	},
};
