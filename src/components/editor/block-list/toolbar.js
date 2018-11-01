/** @flow
 * @format */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import styles from './toolbar.scss';

type PropsType = {
	clientId: string,
	onButtonPressed: ( button: number, clientId: string ) => void,
};

export const ToolbarButton = {
	UP: 1,
	DOWN: 2,
	SETTINGS: 3,
	DELETE: 4,
	PLUS: 5,
};

export default class Toolbar extends React.Component<PropsType> {
	render() {
		return (
			<View style={ styles.toolbar }>
				<TouchableOpacity
					onPress={ this.props.onButtonPressed.bind(
						this,
						ToolbarButton.PLUS,
						this.props.clientId
					) }
				>
					<View style={ styles.toolbarButton }>
						<Text>+</Text>
					</View>
				</TouchableOpacity>
				<View style={ styles.buttonSeparator } />
				<TouchableOpacity
					onPress={ this.props.onButtonPressed.bind( this, ToolbarButton.UP, this.props.clientId ) }
				>
					<View style={ styles.toolbarButton }>
						<Text>▲</Text>
					</View>
				</TouchableOpacity>
				<View style={ styles.buttonSeparator } />
				<TouchableOpacity
					onPress={ this.props.onButtonPressed.bind(
						this,
						ToolbarButton.DOWN,
						this.props.clientId
					) }
				>
					<View style={ styles.toolbarButton }>
						<Text>▼</Text>
					</View>
				</TouchableOpacity>
				<View style={ styles.buttonSeparator } />
				<TouchableOpacity
					onPress={ this.props.onButtonPressed.bind(
						this,
						ToolbarButton.SETTINGS,
						this.props.clientId
					) }
				>
					<View style={ styles.toolbarButton }>
						{ /* eslint-disable-next-line jsx-a11y/accessible-emoji */ }
						<Text>⚙️</Text>
					</View>
				</TouchableOpacity>
				<View style={ styles.buttonSeparator } />
				<TouchableOpacity
					onPress={ this.props.onButtonPressed.bind(
						this,
						ToolbarButton.DELETE,
						this.props.clientId
					) }
				>
					<View style={ styles.toolbarButton }>
						<Text>🗑</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}
