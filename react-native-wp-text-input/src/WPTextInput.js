/**
 * External dependencies
 */
import React from 'react';
import { requireNativeComponent, TextInput, Text, Platform, UIManager, TouchableWithoutFeedback } from 'react-native';
const NativeWPTextInput = requireNativeComponent( 'WPTextInput' );

const emptyFunctionThatReturnsTrue = () => true;

export default class WPTextInput extends TextInput {
	componentDidUpdate( prevProps ) {
		if ( this.props.isSelected && ! prevProps.isSelected ) {
			this._editor.focus();
		} else if ( ! this.props.isSelected && prevProps.isSelected ) {
			this._editor.blur();
		}

		super.componentDidUpdate( prevProps );
	}

	render() {
		if ( Platform.OS === 'ios' ) {
			return this._wpRenderIOS();
		} else if ( Platform.OS === 'android' ) {
			return this._wpRenderAndroid();
		}
	}

	_wpRenderIOS() {
		const props = Object.assign( {}, this.props );
		props.style = [ this.props.style ];

		if ( props.selection && props.selection.end === null ) {
			props.selection = {
				start: props.selection.start,
				end: props.selection.start,
			};
		}

		return (
			<NativeWPTextInput
				ref={ ( ref ) => {
					this._editor = ref;
					this._setNativeRef( ref );
				} }
				{ ...props }
				onFocus={ this._onFocus }
				onBlur={ this._onBlur }
				onChange={ this._onChange }
				onContentSizeChange={ this.props.onContentSizeChange }
				onSelectionChange={ this._onSelectionChange }
				onTextInput={ this._onTextInput }
				onSelectionChangeShouldSetResponder={ emptyFunctionThatReturnsTrue }
				text={ this._getText() }
				dataDetectorTypes={ this.props.dataDetectorTypes }
				onScroll={ this._onScroll }
			/>
		);
	}

	_wpRenderAndroid() {
		const props = Object.assign( {}, this.props );
		props.style = [ this.props.style ];
		props.autoCapitalize = UIManager.getViewManagerConfig(
			'AndroidTextInput',
		).Constants.AutoCapitalizationType[ props.autoCapitalize || 'sentences' ];
		/* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
		* suppresses an error when upgrading Flow's support for React. To see the
		* error delete this comment and run Flow. */
		let children = this.props.children;
		let childCount = 0;
		React.Children.forEach( children, () => ++childCount );
		/*
		invariant(
			!(this.props.value && childCount),
			'Cannot specify both value and children.',
			);
		*/
		if ( childCount > 1 ) {
			children = <Text>{ children }</Text>;
		}

		if ( props.selection && props.selection.end === null ) {
			props.selection = {
				start: props.selection.start,
				end: props.selection.start,
			};
		}

		const textContainer = (
			<NativeWPTextInput
				ref={ ( ref ) => {
					this._editor = ref;
					this._setNativeRef( ref );
				} }
				{ ...props }
				mostRecentEventCount={ 0 }
				onFocus={ this._onFocus }
				onBlur={ this._onBlur }
				onChange={ this._onChange }
				onSelectionChange={ this._onSelectionChange }
				onTextInput={ this._onTextInput }
				text={ this._getText() }
				children={ children }
				disableFullscreenUI={ this.props.disableFullscreenUI }
				textBreakStrategy={ this.props.textBreakStrategy }
				onScroll={ this._onScroll }
			/>
		);

		return (
			<TouchableWithoutFeedback
				onLayout={ props.onLayout }
				onPress={ this._onPress }
				accessible={ this.props.accessible }
				accessibilityLabel={ this.props.accessibilityLabel }
				accessibilityRole={ this.props.accessibilityRole }
				accessibilityStates={ this.props.accessibilityStates }
				nativeID={ this.props.nativeID }
				testID={ this.props.testID }>
				{ textContainer }
			</TouchableWithoutFeedback>
		);
	}
}
