/**
 * @format
 * @flow
 */

import React from 'react';
import { Platform, Switch, Text, View, FlatList, Picker } from 'react-native';
import RecyclerViewList, { DataSource } from 'react-native-recyclerview-list';
import BlockHolder from './block-holder';
import { ToolbarButton } from './constants';
import type { BlockType } from '../store/';
import styles from './block-manager.scss';
// Gutenberg imports
import { getBlockType, getBlockTypes, serialize, createBlock } from '@wordpress/blocks';

export type BlockListType = {
	onChange: ( clientId: string, attributes: mixed ) => void,
	focusBlockAction: string => mixed,
	moveBlockUpAction: string => mixed,
	moveBlockDownAction: string => mixed,
	deleteBlockAction: string => mixed,
	createBlockAction: ( string, BlockType, string ) => mixed,
	blocks: Array<BlockType>,
	aztechtml: string,
	refresh: boolean,
};

type PropsType = BlockListType;
type StateType = {
	dataSource: DataSource,
	showHtml: boolean,
	blockTypePickerVisible: boolean,
	selectedBlockType: string,
};

export default class BlockManager extends React.Component<PropsType, StateType> {
	_recycler = null;
	availableBlockTypes = getBlockTypes();

	constructor( props: PropsType ) {
		super( props );
		this.state = {
			dataSource: new DataSource( this.props.blocks, ( item: BlockType ) => item.clientId ),
			showHtml: false,
			blockTypePickerVisible: false,
			selectedBlockType: 'core/paragraph',
		};
	}

	onBlockHolderPressed( clientId: string ) {
		this.props.focusBlockAction( clientId );
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

	findDataSourceIndexForFocusedItem() {
		for ( let i = 0; i < this.state.dataSource.size(); ++i ) {
			const block = this.state.dataSource.get( i );
			if ( block.focused === true ) {
				return i;
			}
		}
		return -1;
	}

	static isAdditionOrDeletion( newProps: PropsType, currState: StateType ) {
		return currState.dataSource.size() !== newProps.blocks.length;
	}

	// returns true if focus, content, or position change
	static isFocusContentPositionChange( newProps: PropsType, currState: StateType ) {
		// checks whether there's been a `focused` flag change in the props
		for ( let i = 0; i < currState.dataSource.size(); ++i ) {
			const block = currState.dataSource.get( i );
			const blockUpdate = newProps.blocks[ i ];
			if ( block.clientId === blockUpdate.clientId ) {
				if ( block.focused !== blockUpdate.focused ) {
					return true;
				}
				if ( block.attributes.content !== blockUpdate.attributes.content ) {
					return true;
				}
			} else {
				// same array position and different clientId, this means a move up/down of a block happened
				return true;
			}
		}
		return false;
	}

	static getDerivedStateFromProps( props: PropsType, state: StateType ) {
		if ( ( BlockManager.isAdditionOrDeletion( props, state ) === true ) ||
					( BlockManager.isFocusContentPositionChange( props, state ) === true ) ) {
			return {
				...state,
				dataSource: new DataSource( props.blocks, ( item: BlockType ) => item.clientId ),
			};
		}
		// no state change necessary
		return null;
	}

	// TODO: in the near future this will likely be changed to onShowBlockTypePicker and bound to this.props
	// once we move the action to the toolbar
	showBlockTypePicker() {
		this.setState( { ...this.state, blockTypePickerVisible: true } );
	}

	onBlockTypeSelected( itemValue: string ) {
		this.setState( { ...this.state, selectedBlockType: itemValue, blockTypePickerVisible: false } );

		// find currently focused block
		const clientIdFocused = this.state.dataSource.get( this.findDataSourceIndexForFocusedItem() ).clientId;

		// create an empty block of the selected type
		const newBlock = createBlock( itemValue, { content: 'new test text for a ' + itemValue + ' block' } );
		this.props.createBlockAction( newBlock.clientId, { ...newBlock, focused: false }, clientIdFocused );

		// now set the focus
		this.props.focusBlockAction( newBlock.clientId );
	}

	onToolbarButtonPressed( button: number, clientId: string ) {
		switch ( button ) {
			case ToolbarButton.UP:
				this.props.moveBlockUpAction( clientId );
				break;
			case ToolbarButton.DOWN:
				this.props.moveBlockDownAction( clientId );
				break;
			case ToolbarButton.DELETE:
				this.props.deleteBlockAction( clientId );
				break;
			case ToolbarButton.PLUS:
				this.showBlockTypePicker();
				break;
			case ToolbarButton.SETTINGS:
				// TODO: implement settings
				break;
		}
	}

	serializeToHtml() {
		return this.props.blocks
			.map( ( block ) => {
				const blockType = getBlockType( block.name );
				if ( blockType ) {
					return serialize( [ block ] ) + '\n\n';
				} else if ( block.name === 'aztec' ) {
					return '<aztec>' + block.attributes.content + '</aztec>\n\n';
				}

				return '<span>' + block.attributes.content + '</span>\n\n';
			} )
			.reduce( ( prevVal, value ) => {
				return prevVal + value;
			}, '' );
	}

	componentDidUpdate() {
		// List has been updated, tell the recycler view to update the view
		this.state.dataSource.setDirty();
	}

	onChange( clientId: string, attributes: mixed ) {
		// Update datasource UI
		const index = this.getDataSourceIndexFromClientId( clientId );
		const dataSource = this.state.dataSource;
		const block = dataSource.get( this.getDataSourceIndexFromClientId( clientId ) );
		dataSource.set( index, { ...block, attributes: attributes } );
		// Update Redux store
		this.props.onChange( clientId, attributes );
	}

	render() {
		let list;
		if ( Platform.OS === 'android' ) {
			list = (
				<RecyclerViewList
					ref={ ( component ) => ( this._recycler = component ) }
					style={ styles.list }
					dataSource={ this.state.dataSource }
					renderItem={ this.renderItem.bind( this ) }
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
					data={ this.props.blocks }
					extraData={ this.props.refresh }
					keyExtractor={ ( item ) => item.clientId }
					renderItem={ this.renderItem.bind( this ) }
				/>
			);
		}

		const blockTypePicker = (
			<View>
				<Picker
					selectedValue={ this.state.selectedBlockType }
					onValueChange={ ( itemValue ) => {
						this.onBlockTypeSelected( itemValue );
					} } >
					{ this.availableBlockTypes.map( ( item, index ) => {
						return ( <Picker.Item label={ item.title } value={ item.name } key={ index + 1 } /> );
					} ) }
				</Picker>
			</View>
		);

		return (
			<View style={ styles.container }>
				<View style={ { height: 30 } } />
				<View style={ styles.switch }>
					<Text>View html output</Text>
					<Switch
						activeText={ 'On' }
						inActiveText={ 'Off' }
						value={ this.state.showHtml }
						onValueChange={ ( value ) => this.setState( { showHtml: value } ) }
					/>
				</View>
				{ this.state.showHtml && <Text style={ styles.htmlView }>{ this.serializeToHtml() }</Text> }
				{ ! this.state.showHtml && list }
				{ this.state.blockTypePickerVisible && blockTypePicker }
			</View>
		);
	}

	renderItem( value: { item: BlockType, clientId: string } ) {
		return (
			<BlockHolder
				key={ value.clientId }
				onToolbarButtonPressed={ this.onToolbarButtonPressed.bind( this ) }
				onBlockHolderPressed={ this.onBlockHolderPressed.bind( this ) }
				onChange={ this.onChange.bind( this ) }
				focused={ value.item.focused }
				clientId={ value.clientId }
				{ ...value.item }
			/>
		);
	}
}
