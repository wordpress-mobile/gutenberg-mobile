/**
* @format
* @flow
*/
import { KeyboardAwareFlatList as AndroidKeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { FlatList } from 'react-native';

type PropsType = {
    ...FlatList.propTypes,
    extraScrollHeight: number,
    shouldPreventAutomaticScroll: void => boolean,
    parentHeight: number,
}

const KeyboardAwareFlatList = ( props: PropsType ) => {
	const { extraScrollHeight = 0 } = props;

	return (
		<AndroidKeyboardAwareFlatList { ...props }
			extraScrollHeight={ extraScrollHeight }
			extraHeight={ 0 }
			keyboardDismissMode={ 'none' }
			enableOnAndroid={ true }
			enableResetScrollToCoords={ false }
		/>
	);
};

export default KeyboardAwareFlatList;
