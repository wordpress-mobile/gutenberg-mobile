/**
* @format
*/

/**
 * External dependencies
 */
import React from 'react';
import { KeyboardAvoidingView as AndroidKeyboardAvoidingView } from 'react-native';

const KeyboardAvoidingView = ( propsType ) => {
	const { ...props } = propsType;

	return (
		<AndroidKeyboardAvoidingView { ...props } />
	);
};

export default KeyboardAvoidingView;
