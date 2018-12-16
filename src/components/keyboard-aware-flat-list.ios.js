/**
* @format
* @flow
*/
import { KeyboardAwareFlatList as IOSKeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { FlatList } from 'react-native';

type PropsType = {
    ...FlatList.propTypes,
    extraScrollHeight: number,
}

const KeyboardAwareFlatList = ( props: PropsType ) => {
	const { extraScrollHeight = 0 } = props;
	var flatList;
	var contentOffsetY;
	var onKeyboardWillShow = false;

	return (
		<IOSKeyboardAwareFlatList { ...props }
			innerRef={ ( ref ) => {
				this.flatList = ref;
			} }
			onKeyboardWillHide={ () => {
				this.onKeyboardWillShow = false;
			} }
			onKeyboardDidHide={ () => {
				setTimeout( () => {
					if ( ! this.onKeyboardWillShow && this.contentOffsetY !== undefined ) {
						this.flatList.props.scrollToPosition( 0, this.contentOffsetY, true );
					}
				}, 50 );
			} }
			onKeyboardWillShow={ () => {
				this.onKeyboardWillShow = true;
			} }
			onScroll={ ( event: Object ) => {
				this.contentOffsetY = event.nativeEvent.contentOffset.y;
			} }
			extraScrollHeight={ extraScrollHeight }
			extraHeight={ 0 }
			keyboardDismissMode={ 'none' }
			enableAutomaticScroll={ true }
			enableResetScrollToCoords={ false }
		/>
	);
};

export default KeyboardAwareFlatList;
