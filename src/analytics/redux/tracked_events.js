/* eslint-disable camelcase */
/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { sendEventToHost } from '@wordpress/react-native-bridge';

const INSERTERS = {
	HEADER_INSERTER: 'header-inserter',
	SLASH_INSERTER: 'slash-inserter',
	QUICK_INSERTER: 'quick-inserter',
};

/**
 * Guess which inserter was used to insert/replace blocks.
 *
 * @param {string[]|string} originalBlockIds ids or blocks that are being replaced
 * @param {Object}          metaData         Meta data of the inserted block
 * @return {string | undefined} Insertion source or undefined value
 */
const getBlockInserterUsed = ( originalBlockIds = [], metaData ) => {
	const { inserterMethod, source } = metaData || {};
	const clientIds = Array.isArray( originalBlockIds )
		? originalBlockIds
		: [ originalBlockIds ];

	if ( source === 'inserter_menu' && ! inserterMethod ) {
		return INSERTERS.HEADER_INSERTER;
	}

	if (
		source === 'inserter_menu' &&
		inserterMethod === INSERTERS.QUICK_INSERTER
	) {
		return INSERTERS.QUICK_INSERTER;
	}

	// Inserting a block using a slash command is always a block replacement of
	// a paragraph block. Checks the block contents to see if it starts with '/'.
	// This check must go _after_ the block switcher check because it's possible
	// for the user to type something like "/abc" that matches no block type and
	// then use the block switcher, and the following tests would incorrectly capture
	// that case too.
	if (
		clientIds.length === 1 &&
		select( 'core/block-editor' ).getBlockName( clientIds[ 0 ] ) ===
			'core/paragraph' &&
		select( 'core/block-editor' )
			.getBlockAttributes( clientIds[ 0 ] )
			.content.startsWith( '/' )
	) {
		return INSERTERS.SLASH_INSERTER;
	}

	return undefined;
};

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
 * Track block replacement.
 *
 * @param {Array}          originalBlockIds ID(s) or blocks that are being replaced
 * @param {Object | Array} blocks           Block instance object or an array of such objects
 * @param {number}         indexToSelect    Index of replacement block to select.
 * @param {0|-1|null}      initialPosition  Index of caret after in the selected block after the operation.
 * @param {?Object}        meta             Optional Meta values to be passed to the action object.
 *
 * @return {void}
 */
const trackBlockReplacement = (
	originalBlockIds,
	blocks,
	indexToSelect,
	// eslint-disable-next-line no-unused-vars
	initialPosition = 0,
	meta = {}
) => {
	const insert_method = getBlockInserterUsed( originalBlockIds, meta );

	// To avoid tracking block insertions when replacing a block, we only track replacements
	// when the slash inserter is used.
	if ( insert_method === INSERTERS.SLASH_INSERTER ) {
		trackBlocksHandler( blocks, 'editor_block_inserted', ( { name } ) => ( {
			block_name: name,
			insert_method,
		} ) );
	}
};

/**
 * Track block insertion.
 *
 * @param {Object | Array} blocks          Block instance object or an array of such objects
 * @param {?number}        index           Index at which block should be inserted.
 * @param {?string}        rootClientId    Optional root client ID of block list on which to insert.
 * @param {?boolean}       updateSelection If true block selection will be updated. If false, block selection will not change. Defaults to true.
 * @param {0|-1|null}      initialPosition Initial focus position. Setting it to null prevent focusing the inserted block.
 * @param {?Object}        meta            Optional Meta values to be passed to the action object.
 *
 * @return {void}
 */
function trackBlockInsertion(
	blocks,
	index,
	rootClientId,
	updateSelection,
	// eslint-disable-next-line no-unused-vars
	initialPosition = 0,
	meta = {}
) {
	const insert_method = getBlockInserterUsed( [], meta );

	trackBlocksHandler( blocks, 'editor_block_inserted', ( { name } ) => ( {
		block_name: name,
		insert_method,
	} ) );
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
		insertBlock( blocks, index, rootClientId, updateSelection, meta ) {
			trackBlockInsertion(
				blocks,
				index,
				rootClientId,
				updateSelection,
				undefined,
				meta
			);
		},
		insertBlocks(
			blocks,
			index,
			rootClientId,
			updateSelection,
			initialPosition,
			meta
		) {
			trackBlockInsertion(
				blocks,
				index,
				rootClientId,
				updateSelection,
				initialPosition,
				meta
			);
		},
		replaceBlock: trackBlockReplacement,
		replaceBlocks: trackBlockReplacement,
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
