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

/**
 * Helper function to track block movement events.
 *
 * @param {string[]} clientIds The client IDs of the blocks being moved
 * @param {string}   action    Type of movement (arrows/drag & drop)
 * @return {void}
 */
function trackBlockMoved( clientIds, action ) {
	const block = select( 'core/block-editor' ).getBlock( clientIds?.[ 0 ] );

	if ( block ) {
		const eventProperties = {
			action_source: action,
			inner_block: !! block.innerBlocks.length,
			block_name: block.name,
		};

		sendEventToHost( 'editor_block_moved', eventProperties );
	}
}

/**
 * Helper function to handle when a block is moved by an index position
 *
 * @param {string[]} clientIds The client IDs of the blocks being moved
 * @param {number}   toIndex   Index of the new position of the block
 * @return {void}
 */
function handleBlockMovedByPosition( clientIds, toIndex ) {
	const lastBlockIndex = select( 'core/block-editor' ).getBlockCount() - 1;
	const currentBlockIndex = select( 'core/block-editor' ).getBlockIndex(
		clientIds?.[ 0 ]
	);

	if ( currentBlockIndex >= 0 ) {
		if ( toIndex > currentBlockIndex && toIndex === lastBlockIndex ) {
			// The block was moved to the bottom of the editor
			trackBlockMoved( clientIds, 'move_arrows_to_bottom' );
		} else if ( toIndex < currentBlockIndex && toIndex === 0 ) {
			// The block was moved to the top of the editor
			trackBlockMoved( clientIds, 'move_arrows_to_top' );
		}
	}
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
		moveBlocksUp( clientIds ) {
			trackBlockMoved( clientIds, 'move_arrows_up' );
		},
		moveBlocksDown( clientIds ) {
			trackBlockMoved( clientIds, 'move_arrows_down' );
		},
		moveBlocksToPosition(
			clientIds,
			_fromRootClientId,
			_toRootClientId,
			toIndex
		) {
			const isDraggingBlock = select(
				'core/block-editor'
			).isDraggingBlocks();

			if ( isDraggingBlock ) {
				trackBlockMoved( clientIds, 'drag_and_drop' );
			} else {
				handleBlockMovedByPosition( clientIds, toIndex );
			}
		},
	},
};
