import React from 'react';
import { requireNativeComponent, ScrollView, Platform } from 'react-native';
const NativeWPScrollView = requireNativeComponent( 'WPScrollView' );

let AndroidScrollView = NativeWPScrollView;

export default class WPScrollView extends ScrollView {
    render() {
        //this.setNativeProps({layerType: '1, null'});
        return super.render();
    }
}