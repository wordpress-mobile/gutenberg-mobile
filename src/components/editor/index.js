/** @flow
 * @format */

import '../../globals';

import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
// Gutenberg imports
import { registerCoreBlocks } from '@wordpress/block-library';
import {
	createBlock,
	parse,
} from '@wordpress/blocks';
import { Platform, Switch, Text, View, FlatList, KeyboardAvoidingView } from 'react-native';

import initialHtml from './initial-html';
import BlockList from '../../components/editor/block-list';
import BlockPicker from './block-picker';
import styles from './index.scss';
import HTMLTextInput from '../../components/html-text-input';

type PropsType = {
	initialData: string | Store,
};

class NativeEditor extends Component<PropsType> {
	constructor( props: PropsType ) {
		super( props );

		this.showBlockTypePicker = this.showBlockTypePicker.bind( this );
		this.handleSwitchEditor = this.handleSwitchEditor.bind( this );
		this.handleInspectBlocksChanged = this.handleInspectBlocksChanged.bind( this );

		const initialState =
			typeof props.initialData === 'object' ?
				props.initialData :
				parse( props.initialData || initialHtml );

		props.onResetBlocks( initialState );

		this.state = {
			showHtml: false,
			inspectBlocks: false,
			blockTypePickerVisible: false,
			selectedBlockType: 'core/paragraph', // just any valid type to start from
		};
	}

	// TODO: in the near future this will likely be changed to onShowBlockTypePicker and bound to this.props
	// once we move the action to the toolbar
	showBlockTypePicker( show: boolean ) {
		this.setState( { ...this.state, blockTypePickerVisible: show } );
	}

	onBlockTypeSelected( itemValue: string ) {
		this.setState( { ...this.state, selectedBlockType: itemValue, blockTypePickerVisible: false } );

		// create an empty block of the selected type
		const newBlock = createBlock( itemValue, { content: 'new test text for a ' + itemValue + ' block' } );

		this.props.onInsertBlocks( [ newBlock ], this.props.selectedBlockIndex + 1 );

		// now set the focus
		this.props.onSelect( newBlock.clientId );
	}

	handleSwitchEditor( showHtml: boolean ) {
		this.setState( { showHtml } );
	}

	handleInspectBlocksChanged( inspectBlocks: boolean ) {
		this.setState( { inspectBlocks } );
	}

	render() {
		const blockTypePicker = (
			<BlockPicker
				visible={ this.state.blockTypePickerVisible }
				onDismiss={ () => {
					this.showBlockTypePicker( false );
				} }
				onValueSelected={ ( itemValue ) => {
					this.onBlockTypeSelected( itemValue );
				} }
			/>
		);

		return (
			<View style={ styles.container }>
				<View style={ styles.switch }>
					<Switch
						activeText={ 'On' }
						inActiveText={ 'Off' }
						value={ this.state.showHtml }
						onValueChange={ this.handleSwitchEditor }
					/>
					<Text style={ styles.switchLabel }>View html output</Text>
					<Switch
						activeText={ 'On' }
						inActiveText={ 'Off' }
						value={ this.state.inspectBlocks }
						onValueChange={ this.handleInspectBlocksChanged }
					/>
					<Text style={ styles.switchLabel }>Inspect blocks</Text>
				</View>
				{ this.state.showHtml && this.renderHTML() }
				{ ! this.state.showHtml &&
					<BlockList
						inspectBlocks={ this.state.inspectBlocks }
						showBlockTypePicker={ this.showBlockTypePicker }/>
				}
				{ blockTypePicker }
			</View>
		);
	}

	renderHTML() {
		return (
			// TODO: replace with `editor/block-list/block-html`
			<HTMLTextInput blocks={ this.props.blocks } parseBlocksAction={ this.props.parseBlocksAction } />
		);
	}
}

export default compose( [
	withSelect( ( select, { rootClientId } ) => {
		const {
			getBlockOrder,
			getBlocks,
			getBlockIndex,
			getSelectedBlockClientId,
		} = select( 'core/editor' );

		return {
			blockClientIds: getBlockOrder( rootClientId ),
			blocks: getBlocks(),
			selectedBlockIndex: getBlockIndex( getSelectedBlockClientId(), rootClientId ),
			rootClientId,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			insertBlocks,
			resetBlocks,
			selectBlock,
		} = dispatch( 'core/editor' );

		return {
			onInsertBlocks: insertBlocks,
			onResetBlocks: resetBlocks,
			onSelect: selectBlock,
			parseBlocksAction: () => {},
		};
	} ),
] )( NativeEditor );
