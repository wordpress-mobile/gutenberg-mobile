/** @flow
 * @format */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Dashicon } from '@wordpress/components';

type PropsType = {
	disabled: boolean,
	icon: string,
	onPress: () => void,
};

const styles = StyleSheet.create( {
	container: {
		width: 44,
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
	},
} );

export default class InlineToolbarButton extends React.Component<PropsType> {
	static defaultProps = {
		disabled: false,
	};

	render() {
		const { disabled, icon, onPress } = this.props;

		return (
			<TouchableOpacity onPress={ onPress } disabled={ disabled } >
				<View style={ [ styles.container, disabled && { opacity: 0.3 } ] }>
					<Dashicon icon={ icon } />
				</View>
			</TouchableOpacity>
		);
	}
}
