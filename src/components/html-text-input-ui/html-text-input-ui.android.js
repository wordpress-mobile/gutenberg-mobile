/**
 * @format
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { ScrollView } from 'react-native';

/**
 * Internal dependencies
 */
import styles from './html-text-input-ui.scss';
import KeyboardAvoidingView from '../keyboard-avoiding-view';

class HTMLInputContainer extends React.Component {
	render() {
		return (
			<KeyboardAvoidingView style={ styles.keyboardAvoidingView } parentHeight={ this.props.parentHeight }>
				<ScrollView style={ styles.scrollView } >
					{ this.props.children }
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

HTMLInputContainer.scrollEnabled = false;

export default HTMLInputContainer;
