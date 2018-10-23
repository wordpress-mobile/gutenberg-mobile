/** @flow
 * @format */

import React from 'react';

import BlockManager, { type BlockListType } from '../block-management/block-manager';
import { SlotFillProvider } from '@wordpress/components';

type PropsType = BlockListType;
type StateType = {};

export default class MainScreen extends React.Component<PropsType, StateType> {
	render() {
		return (<SlotFillProvider><BlockManager { ...this.props } /></SlotFillProvider>);
	}
}
