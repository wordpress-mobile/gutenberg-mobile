/**
* @format
* @flow
*/

import React from 'react';
import { KeyboardAvoidingView as AndroidKeyboardAvoidingView } from 'react-native';

const KeyboardAvoidingView = ( props ) => {
	return (
		<AndroidKeyboardAvoidingView { ...props } />
	);
};

export default KeyboardAvoidingView;
