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

	console.log('ivasavic', 'height ' + keyboardVerticalOffset);
	console.log('ivasavic', 'style ' + JSON.stringify(style));

	return (
		<IOSKeyboardAvoidingView style={ style } behavior={ 'padding' } keyboardVerticalOffset={ keyboardVerticalOffset } />
	);
};

export default KeyboardAvoidingView;
