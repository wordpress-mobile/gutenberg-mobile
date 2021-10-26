/* eslint-disable camelcase */
/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { sendEventToHost } from '@wordpress/react-native-bridge';

/**
 * Retrieves a block object. If the block is not an object,
 * it tries to retrieve the block from the store.
 *
 * @param {string|Object} block Block objectg or string identifier.
 * @return {Object} block object or an empty object if not found.
 */
function getBlockObject( block ) {
	if ( typeof block === 'object' ) {
		return block;
	}
	return select( 'core/block-editor' ).getBlock( block ) || {};
}

/**
 * Helper function to recursively track block events.
 * Each inner block will be tracked as a separate event if block contains inner blocks.
 *
 * @param {Array|Object} blocks            A single or collection of block objects or block identifiers.
 * @param {string}       eventName         Event name used to track.
 * @param {Function}     propertiesHandler Callback to transform properties.
 * @param {Object}       parentBlock       Parent block. optional
 * @return {void}
 */
function trackBlocksHandler(
	blocks,
	eventName,
	propertiesHandler = () => {},
	parentBlock
) {
	const blockArray = [ blocks ].flat();
	if ( ! blocks || ! blockArray.length ) {
		return;
	}

	blockArray.forEach( ( block ) => {
		const blockObject = getBlockObject( block );
		const eventProperties = {
			...propertiesHandler( blockObject ),
			inner_block: !! parentBlock,
		};

		if ( parentBlock ) {
			eventProperties.parent_block_name = parentBlock.name;
		}

		sendEventToHost( eventName, eventProperties );

		if ( blockObject.innerBlocks ) {
			trackBlocksHandler(
				blockObject.innerBlocks,
				eventName,
				propertiesHandler,
				blockObject
			);
		}
	} );
}

export const trackedEvents = {
	'core/block-editor': {
		insertBlock( blocks ) {
			trackBlocksHandler(
				blocks,
				'editor_block_inserted',
				( { name } ) => ( { block_name: name } )
			);
		},
		insertBlocks( blocks ) {
			trackBlocksHandler(
				blocks,
				'editor_block_inserted',
				( { name } ) => ( { block_name: name } )
			);
		},
	},
};
