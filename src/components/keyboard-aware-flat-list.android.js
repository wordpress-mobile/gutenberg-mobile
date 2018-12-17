/**
* @format
* @flow
*/
import { KeyboardAwareFlatList as AndroidKeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { FlatList } from 'react-native';

type PropsType = {
    ...FlatList.propTypes,
	shouldPreventAutomaticScroll: void => boolean,
	parentHeight: number,
	blockToolbarHeight: number,
	innerToolbarHeight: number,
}

const KeyboardAwareFlatList = ( props: PropsType ) => {
	return (
		<AndroidKeyboardAwareFlatList { ...props }
			extraScrollHeight={ 0 }
			extraHeight={ 0 }
			keyboardDismissMode={ 'none' }
			enableOnAndroid={ true }
			enableResetScrollToCoords={ false }
		/>
	);
};

export default KeyboardAwareFlatList;
