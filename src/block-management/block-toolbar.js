/**
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View } from 'react-native';
import { Toolbar, ToolbarButton } from '@wordpress/components';
import { BlockFormatControls, BlockControls } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

type PropsType = {
	onInsertClick: void => void,
};

export default class BlockToolbar extends Component<PropsType> {
	render() {
		return (
			<View style={ { height: 44, backgroundColor: 'white', flexDirection: 'row' , borderTopColor: '#a8bece', borderTopWidth: 1} }>
				<Toolbar>
					<ToolbarButton
						label={ __( 'Add block' ) }
						icon="insert"
						onClick={ this.props.onInsertClick }
					/>
				</Toolbar>
				<BlockControls.Slot />
				<BlockFormatControls.Slot />
			</View>
		);
	}
}
