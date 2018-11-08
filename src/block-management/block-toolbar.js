import React, { Component } from 'react';
import { View } from 'react-native';
import { BlockFormatControls, BlockControls } from '@wordpress/editor';

export default class BlockToolbar extends Component {
	render() {
		return (
			<View style={ { height: 44, backgroundColor: 'white', flexDirection: 'row' , borderTopColor: '#a8bece', borderTopWidth: 1} }>
				<BlockControls.Slot />
				<BlockFormatControls.Slot />
			</View>
		);
	}
}
