/**
* @format
* @flow
*/

import React from 'react';
import { KeyboardAvoidingView as IOSKeyboardAvoidingView, Dimensions } from 'react-native';

const KeyboardAvoidingView = ( props ) => {
	const { style, parentHeight } = props;
	const { height: fullHeight } = Dimensions.get( 'window' );
	const keyboardVerticalOffset = fullHeight - parentHeight;

	return (
		<IOSKeyboardAvoidingView { ...props } behavior={ 'padding' } keyboardVerticalOffset={ keyboardVerticalOffset } />
	);
};

export default KeyboardAvoidingView;
