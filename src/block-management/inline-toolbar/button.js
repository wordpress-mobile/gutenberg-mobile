/** @flow
 * @format */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Dashicon } from '@wordpress/components';

type PropsType = {
    icon: string,
    onPress: () => void,
};

const style = {
	width: 44,
	height: 44,
	justifyContent: 'center',
	alignItems: 'center',
};

export default class InlineToolbarButton extends React.Component<PropsType> {
	render() {
		const { icon, onPress } = this.props;

		return (
			<TouchableOpacity onPress={ onPress }>
				<View style={ style }>
					<Dashicon icon={ icon } />
				</View>
			</TouchableOpacity>
		);
	}
}
