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
		return <RNTOverflowView pointerEvents={ this.props.presentingOverflow ? 'box-none' : 'auto' } { ...this.props } />;
	}
}

const RNTOverflowView = requireNativeComponent( 'RNTOverflowView', OverflowView );

export default OverflowView;
