/**
* @format
* @flow
*/


import { KeyboardAvoidingView as AndroidKeyboardAvoidingView } from 'react-native';

const KeyboardAvoidingView = ( props ) => {
	const { style } = props;
	return (
		<AndroidKeyboardAvoidingView style={ style } />
	);
};

export default KeyboardAvoidingView;
