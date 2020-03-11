/**
 * External dependencies
 *
 * @format
 */

/**
 * External dependencies
 */
import React from 'react';
import { requireNativeComponent } from 'react-native';

class OverflowView extends React.Component {
	render() {
		return <RNTOverflowView { ...this.props } />;
	}
}

const RNTOverflowView = requireNativeComponent( 'RNTOverflowView', OverflowView );

export default OverflowView;