/**
* @format
*/

/**
 * External dependencies
 */
import { FlatList } from 'react-native';

/**
 * Internal dependencies
 */
import KeyboardAvoidingView from '../components/keyboard-avoiding-view';

export const KeyboardAwareFlatList = ( props ) => {
	return (
		<KeyboardAvoidingView style={ { flex: 1 } }>
			<FlatList { ...props } />
		</KeyboardAvoidingView>
	);
};

export const handleCaretVerticalPositionChange = () => {
	//no need to handle on Android, it is system managed
};

export default { KeyboardAwareFlatList, handleCaretVerticalPositionChange };
