/**
* @format
* @flow
*/

import React from 'react';

import { View, NativeModules, KeyboardAvoidingView as IOSKeyboardAvoidingView } from 'react-native';
const { StatusBarManager } = NativeModules;

type StateType = {
	statusBarHeight: number;
};

type PropsType = {
	...View.propTypes,
}

export default class KeyboardAvoidingView extends React.Component <PropsType, StateType> {
	constructor( props: PropsType ) {
		super( props );

		this.state = {
			statusBarHeight: 0,
		};
	}

	componentDidMount() {
		if ( typeof StatusBarManager.getHeight === 'function' ) {
			console.log('ivasavic', 'missing method ');
			StatusBarManager.getHeight( ( statusBarFrameData ) => {
				this.setState( { statusBarHeight: statusBarFrameData.height } );
			} );
		}
	}

	render() {
		const behavior = 'padding';
		const keyboardVerticalOffset = this.state.statusBarHeight + 44;

		return (
			<IOSKeyboardAvoidingView { ...this.props } behavior={ behavior } keyboardVerticalOffset={ keyboardVerticalOffset } />
		);
	}
}
