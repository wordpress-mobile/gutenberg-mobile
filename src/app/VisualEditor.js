/** @flow
 * @format */

/**
 * External dependencies
 */
import React from 'react';
import { type EmitterSubscription, type InputText } from 'react-native';
import RNReactNativeGutenbergBridge, {
	subscribeSetFocusOnTitle,
	subscribeSetTitle,
} from 'react-native-gutenberg-bridge';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';
import { getUnregisteredTypeHandlerName } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { PostTitle } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import type { BlockType } from '../store/types';
import styles from './style.scss';

type PropsType = {
	title: string,
	editTitle: string => mixed,
	resetEditorBlocks: Array<BlockType> => mixed,
	resetEditorBlocksWithoutUndoLevel: Array<BlockType> => mixed,
	blocks: Array<BlockType>,
	rootViewHeight: number,
	safeAreaBottomInset: number,
	isFullyBordered: boolean,
};

/*
 * This container combines features similar to the following components on Gutenberg:
 * - `gutenberg/packages/editor/src/components/provider/index.js`
 * - `gutenberg/packages/edit-post/src/components/layout/index.js`
 */
class VisualEditor extends React.Component<PropsType> {
	postTitleRef: ?InputText;
	subscriptionParentSetFocusOnTitle: ?EmitterSubscription;
	subscriptionParentSetTitle: ?EmitterSubscription;

	componentDidMount() {
		this.subscriptionParentSetFocusOnTitle = subscribeSetFocusOnTitle( () => {
			if ( this.postTitleRef ) {
				this.postTitleRef.focus();
			}
		} );

		this.subscriptionParentSetTitle = subscribeSetTitle( ( payload ) => {
			this.props.editTitle( payload.title );
		} );

		this.signalEditorDidMount();
	}

	componentWillUnmount() {
		if ( this.subscriptionParentSetFocusOnTitle ) {
			this.subscriptionParentSetFocusOnTitle.remove();
		}

		if ( this.subscriptionParentSetTitle ) {
			this.subscriptionParentSetTitle.remove();
		}
	}

	signalEditorDidMount() {
		const { blocks } = this.props;
		const isUnsupportedBlock = ( { name } ) => name === getUnregisteredTypeHandlerName();
		const unsupportedBlocks = blocks.filter( isUnsupportedBlock );
		const hasUnsupportedBlocks = ! isEmpty( unsupportedBlocks );

		RNReactNativeGutenbergBridge.editorDidMount( hasUnsupportedBlocks );
	}

	blockHolderBorderStyle() {
		return this.props.isFullyBordered ? styles.blockHolderFullBordered : styles.blockHolderSemiBordered;
	}

	renderHeader() {
		const {
			editTitle,
			title,
		} = this.props;

		return (
			<PostTitle
				innerRef={ ( ref ) => {
					this.postTitleRef = ref;
				} }
				title={ title }
				onUpdate={ editTitle }
				placeholder={ __( 'Add title' ) }
				borderStyle={ this.blockHolderBorderStyle() }
				focusedBorderColor={ styles.blockHolderFocused.borderColor }
				accessibilityLabel="post-title"
			/>
		);
	}

	render() {
		const {
			blocks,
			resetEditorBlocks,
			resetEditorBlocksWithoutUndoLevel,
		} = this.props;

		return (
			<BlockEditorProvider
				value={ blocks }
				onInput={ resetEditorBlocksWithoutUndoLevel }
				onChange={ resetEditorBlocks }
				settings={ null }
			>
				<BlockList
					header={ this.renderHeader() }
					isFullyBordered={ this.props.isFullyBordered }
					rootViewHeight={ this.props.rootViewHeight }
					safeAreaBottomInset={ this.props.safeAreaBottomInset }
				/>
			</BlockEditorProvider>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getEditorBlocks,
			getEditedPostAttribute,
		} = select( 'core/editor' );

		return {
			blocks: getEditorBlocks(),
			title: getEditedPostAttribute( 'title' ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			editPost,
			resetEditorBlocks,
		} = dispatch( 'core/editor' );

		return {
			editTitle( title ) {
				editPost( { title } );
			},
			resetEditorBlocks,
			resetEditorBlocksWithoutUndoLevel( blocks ) {
				resetEditorBlocks( blocks, {
					__unstableShouldCreateUndoLevel: false,
				} );
			},
		};
	} ),
] )( VisualEditor );
