/** @format */

// @flow

import React, { Component } from 'react';

import BlockManager, { type BlockListType } from '../block-management/block-manager';

type PropsType = BlockListType;
type StateType = {};

export default class MainScreen extends Component<PropsType, StateType> {
	render() {
		return <BlockManager { ...this.props } />;
	}
}
