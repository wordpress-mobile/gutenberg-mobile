import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { BlockFormatControls, BlockControls } from '@wordpress/editor';

export default class BlockToolbar extends Component {
  render() {
    return (
        <View style={ {backgroundColor: '#DCDCDC', flexDirection: 'row'} }>
            <BlockControls.Slot/>
            <BlockFormatControls.Slot/>
        </View>
    );
  }
}
