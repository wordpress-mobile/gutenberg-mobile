/**
 * @format
 * @flow
 */

import React from 'react';
import { View, Text } from 'react-native';

type PropsType = {
	onChange: ( clientId: string, attributes: mixed ) => void,
	onToolbarButtonPressed: ( button: number, clientId: string ) => void,
	onBlockHolderPressed: ( clientId: string ) => void,
};

type StateType = {
	selected: boolean,
	focused: boolean,
};

// Styles
import styles from './style.scss';

export default class UnsupportedBlockEdit extends React.Component<PropsType, StateType> {
	render() {
		return (
			<View style={ styles.unsupportedBlock }>
				<Text style={ styles.unsupportedBlockMessage }>Unsupported</Text>
			</View>
		);
	}
}
