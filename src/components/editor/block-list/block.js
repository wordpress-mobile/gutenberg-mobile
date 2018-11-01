/**
 * External dependencies
 */
import { get, reduce, size, castArray, first, last } from 'lodash';
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import { Component, findDOMNode, Fragment } from '@wordpress/element';

import {
	cloneBlock,
	getBlockType,
	getSaveElement,
	isUnmodifiedDefaultBlock,
	getUnregisteredTypeHandlerName,
} from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { BlockEdit } from '@wordpress/editor';
import Toolbar from './toolbar';

import styles from './block.scss';
import blockStyles from '../../../block-styles.scss';

export class BlockListBlock extends Component {
	constructor() {
		super( ...arguments );

		this.setAttributes = this.setAttributes.bind( this );
		this.mergeBlocks = this.mergeBlocks.bind( this );
		this.insertBlocksAfter = this.insertBlocksAfter.bind( this );
	}

	setAttributes( attributes ) {
		const { block, onChange } = this.props;
		const type = getBlockType( block.name );
		onChange( block.clientId, attributes );

		const metaAttributes = reduce( attributes, ( result, value, key ) => {
			if ( get( type, [ 'attributes', key, 'source' ] ) === 'meta' ) {
				result[ type.attributes[ key ].meta ] = value;
			}

			return result;
		}, {} );

		if ( size( metaAttributes ) ) {
			this.props.onMetaChange( {
				...this.props.meta,
				...metaAttributes,
			} );
		}
	}

	mergeBlocks( forward = false ) {
		const { block, previousBlockClientId, nextBlockClientId, onMerge } = this.props;

		// Do nothing when it's the first block.
		if (
			( ! forward && ! previousBlockClientId ) ||
			( forward && ! nextBlockClientId )
		) {
			return;
		}

		if ( forward ) {
			onMerge( block.clientId, nextBlockClientId );
		} else {
			onMerge( previousBlockClientId, block.clientId );
		}
	}

	insertBlocksAfter( blocks ) {
		this.props.onInsertBlocks( blocks, this.props.order + 1 );
	}

	renderToolbarIfBlockFocused() {
		if ( this.props.isSelected ) {
			return (
				<Toolbar
					clientId={ this.props.clientId }
					onButtonPressed={ this.props.onToolbarButtonPressed }
				/>
			);
		}

		// Return empty view, toolbar won't be rendered
		return <View />;
	}

	render() {
		const {
			block,
			clientId,
			isSelected,
		} = this.props;

		const { name: blockName, isValid } = block;
		const blockType = getBlockType( blockName );

		// translators: %s: Type of block (i.e. Text, Image etc)
		const blockLabel = sprintf( __( 'Block: %s' ), blockType.title );
		const showBlockInserter = isSelected && isValid;

		const blockElementId = `block-${ clientId }`;

		return (
			<TouchableWithoutFeedback
				onPress={ this.props.onBlockPressed.bind( this, clientId ) }
			>
				<View
					style={ styles.blockHolder }
					id={ blockElementId }
					ref={ this.setBlockListRef }
					data-type={ block.name }
					tabIndex="0"
					aria-label={ blockLabel }
				>
					<BlockEdit
						name={ blockName }
						isSelected={ isSelected }
						attributes={ block.attributes }
						setAttributes={ this.setAttributes }
						style={ blockStyles[ 'block' + blockType.title ] }
						//insertBlocksAfter={ this.insertBlocksAfter }
						onReplace={ this.props.onReplace }
						mergeBlocks={ this.mergeBlocks }
						clientId={ clientId }
					/>

					{ this.renderToolbarIfBlockFocused() }

					{ showBlockInserter && (
						<View style={ styles.containerStyleAddHere } >
							<View style={ styles.lineStyleAddHere }></View>
							<Text style={ styles.labelStyleAddHere } >ADD BLOCK HERE</Text>
							<View style={ styles.lineStyleAddHere }></View>
						</View>
					) }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

const applyWithSelect = withSelect( ( select, { clientId, rootClientId } ) => {
	const {
		isBlockSelected,
		getPreviousBlockClientId,
		getNextBlockClientId,
		getBlock,
		getBlockIndex,
		getEditedPostAttribute,
		getBlockMode,
		isSelectionEnabled,
		hasSelectedInnerBlock,
	} = select( 'core/editor' );
	const isSelected = isBlockSelected( clientId );
	const block = getBlock( clientId );
	const previousBlockClientId = getPreviousBlockClientId( clientId );
	const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );

	return {
		nextBlockClientId: getNextBlockClientId( clientId ),
		order: getBlockIndex( clientId, rootClientId ),
		meta: getEditedPostAttribute( 'meta' ),
		mode: getBlockMode( clientId ),
		isSelectionEnabled: isSelectionEnabled(),
		previousBlockClientId,
		block,
		isSelected,
		isParentOfSelectedBlock,
	};
} );

const applyWithDispatch = withDispatch( ( dispatch, ownProps ) => {
	const {
		updateBlockAttributes,
		selectBlock,
		insertBlocks,
		insertDefaultBlock,
		removeBlock,
		mergeBlocks,
		replaceBlocks,
		editPost,
		toggleSelection,
	} = dispatch( 'core/editor' );

	return {
		onChange( clientId, attributes ) {
			updateBlockAttributes( clientId, attributes );
		},
		onSelect( clientId = ownProps.clientId, initialPosition ) {
			selectBlock( clientId, initialPosition );
		},
		onInsertBlocks( blocks, index ) {
			const { rootClientId, layout } = ownProps;
			blocks = blocks.map( ( block ) => cloneBlock( block, { layout } ) );
			insertBlocks( blocks, index, rootClientId );
		},
		onInsertDefaultBlockAfter() {
			const { order, rootClientId } = ownProps;
			insertDefaultBlock( {}, rootClientId, order + 1 );
		},
		onRemove( clientId ) {
			removeBlock( clientId );
		},
		onMerge( ...args ) {
			mergeBlocks( ...args );
		},
		onReplace( blocks ) {
			const { layout } = ownProps;
			blocks = castArray( blocks ).map( ( block ) => (
				cloneBlock( block, { layout } )
			) );
			replaceBlocks( [ ownProps.clientId ], blocks );
		},
		onMetaChange( meta ) {
			editPost( { meta } );
		},
		toggleSelection( selectionEnabled ) {
			toggleSelection( selectionEnabled );
		},
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch,
)( BlockListBlock );
