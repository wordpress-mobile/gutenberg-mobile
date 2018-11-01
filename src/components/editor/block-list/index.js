/**
 * External dependencies
 */
import {
	findLast,
	map,
	invert,
	mapValues,
	sortBy,
	throttle,
	castArray,
} from 'lodash';
import { Platform, Switch, Text, View, FlatList, KeyboardAvoidingView } from 'react-native';
import RecyclerViewList, { DataSource } from 'react-native-recyclerview-list';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import {
	createBlock,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockListBlock from './block';
import { ToolbarButton } from './toolbar';
import styles from './index.scss';

class BlockList extends Component {
	constructor( props: PropsType ) {
		super( props );

		this.renderItem = this.renderItem.bind( this );
		this.onToolbarButtonPressed = this.onToolbarButtonPressed.bind( this );
		this.insertBlocksAfter = this.insertBlocksAfter.bind( this );

		this.state = {
			dataSource: new DataSource( this.props.blockClientIds, ( item: string ) => item ),
		};
	}

	getDataSourceIndexFromClientId( clientId: string ) {
		for ( let i = 0; i < this.state.dataSource.size(); ++i ) {
			const block = this.state.dataSource.get( i );
			if ( block.clientId === clientId ) {
				return i;
			}
		}
		return -1;
	}

	static getDerivedStateFromProps( props: PropsType, state: StateType ) {
		if ( props.blockClientIds !== state.blockClientIds ) {
			// TODO: better reconciliation/sync
			// Note: splice on a range generates an error for android:
			// at RecyclerView._notifyItemRangeRemoved (node_modules/react-native-recyclerview-list/src/RecyclerViewList.js:363:55)
			//    TypeError: Cannot read property 'Commands' of undefined)
			state.dataSource.splice( 0, state.dataSource.size(), ...props.blockClientIds );
			return {
				...state,
				blockClientIds: props.blockClientIds,
			};
		}
		return null;
	}

	onToolbarButtonPressed( button: number, clientId: string ) {
		switch ( button ) {
			case ToolbarButton.UP:
				this.props.onMoveUp( clientId );
				break;
			case ToolbarButton.DOWN:
				this.props.onMoveDown( clientId );
				break;
			case ToolbarButton.DELETE:
				this.props.onRemove( clientId );
				break;
			case ToolbarButton.PLUS:
				this.props.showBlockTypePicker( true );
				break;
			case ToolbarButton.SETTINGS:
				// TODO: implement settings
				break;
		}
	}

	componentDidUpdate() {
		// List has been updated, tell the recycler view to update the view
		this.state.dataSource.setDirty();
	}

	insertBlocksAfter( blocks: Array<Object> ) {
		if ( blocks.length === 0 ) {
			return;
		}

		// find currently focused block
		const focusedItemIndex = this.getDataSourceIndexFromClientId( this.props.selectedBlockClientId );

		// set it into the datasource, and use the same object instance to send it to props/redux
		//this.state.dataSource.splice( focusedItemIndex + 1, 0, ...blocks );
		this.props.onInsertBlocks( blocks, focusedItemIndex + 1 );

		// now set the focus
		this.props.onSelect( blocks[0].clientId ); // this not working atm
	}

	renderItem( { item: clientId } ) {
		const {
			//layout,
			rootClientId
		} = this.props;

		return (
			<BlockListBlock
				key={ 'block-' + clientId }
				clientId={ clientId }
				rootClientId={ rootClientId }
				//layout={ layout }

				onToolbarButtonPressed={ this.onToolbarButtonPressed }
				onBlockPressed={ this.props.onSelect }
				onChange={ this.props.onChange }
				showTitle={ this.state.inspectBlocks }
				insertBlocksAfter={ this.insertBlocksAfter }
			/>
		);
	}

	render() {
		let list;
		const behavior = Platform.OS === 'ios' ? 'padding' : null;
		if ( Platform.OS === 'android' ) {
			list = (
				<RecyclerViewList
					style={ styles.list }
					dataSource={ this.state.dataSource }
					renderItem={ this.renderItem }
					ListEmptyComponent={
						<View style={ { borderColor: '#e7e7e7', borderWidth: 10, margin: 10, padding: 20 } }>
							<Text style={ { fontSize: 15 } }>No blocks :(</Text>
						</View>
					}
				/>
			);
		} else {
			// TODO: we won't need this. This just a temporary solution until we implement the RecyclerViewList native code for iOS
			list = (
				<FlatList
					style={ styles.list }
					data={ this.props.blockClientIds }
					keyExtractor={ ( item ) => item }
					//extraData={ this.props.refresh, this.props.inspectBlocks }
					renderItem={ this.renderItem }
				/>
			);
		}
		return (
			<KeyboardAvoidingView style={ { flex: 1 } } behavior={ behavior }>
				{ list }
			</KeyboardAvoidingView>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			getBlockOrder,
			getSelectedBlockClientId,
		} = select( 'core/editor' );
		const { rootClientId } = ownProps;

		return {
			selectedBlockClientId: getSelectedBlockClientId(),
			rootClientId,
			blockClientIds: getBlockOrder( rootClientId ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			insertBlocks,
			moveBlocksDown,
			moveBlocksUp,
			removeBlock,
			selectBlock,
		} = dispatch( 'core/editor' );

		return {
			onInsertBlocks: insertBlocks,
			onMoveDown: moveBlocksDown,
			onMoveUp: moveBlocksUp,
			onRemove: removeBlock,
			onSelect: selectBlock,
		};
	} ),
] )( BlockList );
