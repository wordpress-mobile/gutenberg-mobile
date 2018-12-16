/**
* @format
* @flow
*/
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, ScrollView, Dimensions } from 'react-native';

type PropsType = {
    ...FlatList.propTypes,
	shouldPreventAutomaticScroll: void => boolean,
	parentHeight: number,
	extraScrollHeight: number,
}

const KeyboardAwareFlatList = ( props: PropsType ) => {
	const { parentHeight, extraScrollHeight } = props;
	const { height: fullHeight } = Dimensions.get( 'window' );
	const keyboardVerticalOffset = fullHeight - parentHeight;

	var flatList;
	var contentOffsetY;
	var onKeyboardWillShow = false;

	return (
		<KeyboardAwareScrollView 
			style={ { flex: 1 }} 
			keyboardDismissMode={ 'none' }
			enableResetScrollToCoords={ false }
			extraScrollHeight={ extraScrollHeight*2 + keyboardVerticalOffset + 5 }
			extraHeight={ 0 }
			innerRef={ ( ref ) => {
				this.flatList = ref;
			} }
			onKeyboardWillHide={ () => {
				this.onKeyboardWillShow = false;
			} }
			onKeyboardDidHide={ () => {
				setTimeout( () => {
					if ( ! this.onKeyboardWillShow 
						&& this.contentOffsetY !== undefined 
						&& ! props.shouldPreventAutomaticScroll() ) {
						// Reset the content position if keyboard is still closed
						this.flatList.props.scrollToPosition( 0, this.contentOffsetY, true );
					}
				}, 50 );
			} }
			onKeyboardWillShow={ () => {
				this.onKeyboardWillShow = true;
			} }
			onScroll={ ( event: Object ) => {
				this.contentOffsetY = event.nativeEvent.contentOffset.y;
			} } >
			<FlatList { ...props }/>
		</KeyboardAwareScrollView>
	);
};

export default KeyboardAwareFlatList;
