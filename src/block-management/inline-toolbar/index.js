/** @flow
 * @format */

import React from 'react';
import { View } from 'react-native';
import InlineToolbarActions from './actions';
import InlineToolbarButton from './button';

type PropsType = {
	clientId: string,
	canMoveUp: boolean,
	canMoveDown: boolean,
	onButtonPressed: ( button: number, clientId: string ) => void,
};

export { InlineToolbarActions };

import styles from './style.scss';

export default class InlineToolbar extends React.Component<PropsType> {
	constructor() {
		super( ...arguments );
		// Flow gets picky about reassigning methods on classes
		// https://github.com/facebook/flow/issues/1517#issuecomment-194538151
		( this: any ).onUpPressed = this.onUpPressed.bind( this );
		( this: any ).onDownPressed = this.onDownPressed.bind( this );
		( this: any ).onDeletePressed = this.onDeletePressed.bind( this );
	}

	onUpPressed() {
		this.props.onButtonPressed( InlineToolbarActions.UP, this.props.clientId );
	}

	onDownPressed() {
		this.props.onButtonPressed( InlineToolbarActions.DOWN, this.props.clientId );
	}

	onDeletePressed() {
		this.props.onButtonPressed( InlineToolbarActions.DELETE, this.props.clientId );
	}

	render() {
		return (
			<View style={ styles.toolbar }>
				<InlineToolbarButton
					disabled={ ! this.props.canMoveUp }
					onPress={ this.onUpPressed }
					icon="arrow-up-alt"
				/>

				<InlineToolbarButton
					disabled={ ! this.props.canMoveDown }
					onPress={ this.onDownPressed }
					icon="arrow-down-alt"
				/>

				<View style={ styles.spacer } />

				<InlineToolbarButton
					onPress={ this.onDeletePressed }
					icon="trash"
				/>
			</View>
		);
	}
}
