/**
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { FlatList, Text, TouchableHighlight, View, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import styles from './block-picker.scss';
import { name as unsupportedBlockName } from '../block-types/unsupported-block';
// Gutenberg imports
import { getBlockTypes } from '@wordpress/blocks';

type PropsType = {
	style?: StyleSheet,
	isReplacement: boolean,
	onValueSelected: ( itemValue: string ) => void,
	onDismiss: () => void,
};

export default class BlockPicker extends Component<PropsType> {
	availableBlockTypes = getBlockTypes().filter( ( { name } ) => name !== unsupportedBlockName );

	render() {
		const numberOfColumns = this.calculateNumberOfColumns();
		return (
			<Modal
				transparent={ true }
				isVisible={ true }
				onSwipe={ this.props.onDismiss }
				onBackButtonPress={ this.props.onDismiss }
				swipeDirection="down"
				style={ [ styles.bottomModal, this.props.style ] }
				backdropColor={ 'lightgrey' }
				backdropOpacity={ 0.4 }
				onBackdropPress={ this.props.onDismiss }>
				<View style={ styles.modalContent }>
					<View style={ styles.shortLineStyle } />
					<FlatList
						scrollEnabled={ false }
						key={ `InserterUI-${ numberOfColumns }` } //re-render when numberOfColumns changes
						keyboardShouldPersistTaps="always"
						numColumns={ numberOfColumns }
						data={ this.availableBlockTypes }
						keyExtractor={ ( item ) => item.name }
						renderItem={ ( { item } ) =>
							<TouchableHighlight
								style={ styles.touchableArea }
								underlayColor={ 'transparent' }
								activeOpacity={ .5 }
								onPress={ () => this.props.onValueSelected( item.name ) }>
								<View style={ styles.modalItem }>
									<View style={ styles.modalIconWrapper }>
										<View style={ styles.modalIcon }>
											{ item.icon.src }
										</View>
									</View>
									<Text style={ styles.modalItemLabel }>{ item.title }</Text>
								</View>
							</TouchableHighlight>
						}
					/>
				</View>
			</Modal>
		);
	}

	calculateNumberOfColumns() {
		const { width: windowWidth } = Dimensions.get( 'window' );
		const { paddingLeft: itemPaddingLeft, paddingRight: itemPaddingRight } = styles.modalItem;
		const { paddingLeft: containerPaddingLeft, paddingRight: containerPaddingRight } = styles.modalContent;
		const { width: itemWidth } = styles.modalIconWrapper;
		const itemTotalWidth = itemWidth + itemPaddingLeft + itemPaddingRight;
		const containerTotalWidth = windowWidth - ( containerPaddingLeft + containerPaddingRight );
		return Math.floor( containerTotalWidth / itemTotalWidth );
	}
}
