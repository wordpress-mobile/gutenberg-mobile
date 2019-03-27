/** @flow
 * @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { type EmitterSubscription, type InputText, LayoutChangeEvent, SafeAreaView } from 'react-native';
import RNReactNativeGutenbergBridge, {
	subscribeParentGetHtml,
	subscribeParentToggleHTMLMode,
	subscribeSetTitle,
	subscribeUpdateHtml,
	subscribeSetFocusOnTitle,
	sendNativeEditorDidLayout,
} from 'react-native-gutenberg-bridge';
import SafeArea from 'react-native-safe-area';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { parse, serialize } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
import { UnsupportedBlock } from '@wordpress/block-library';
import { PostTitle } from '@wordpress/editor';
import { ReadableContentView } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { BlockType } from '../store/types';
import styles from './style.scss';
import HTMLTextInput from '../components/html-text-input';

type PropsType = {
	initialHtmlModeEnabled: boolean,
	editorMode: string,
	editedPostContent: string,
	title: string,
	initialTitle: string,
	initialHtml: string,
	editTitle: string => mixed,
	resetEditorBlocks: Array<BlockType> => mixed,
	resetEditorBlocksWithoutUndoLevel: Array<BlockType> => mixed,
	setupEditor: ( mixed, ?mixed ) => mixed,
	toggleEditorMode: ?string => mixed,
	blocks: Array<BlockType>,
	isReady: boolean,
	mode: string,
	post: ?mixed,
	getEditedPostContent: () => string,
	switchMode: string => mixed,
};

type StateType = {
	rootViewHeight: number,
	safeAreaBottomInset: number,
	isFullyBordered: boolean,
}

/*
 * This container combines features similar to the following components on Gutenberg:
 * - `gutenberg/packages/editor/src/components/provider/index.js`
 * - `gutenberg/packages/edit-post/src/components/layout/index.js`
 */
class AppContainer extends React.Component<PropsType, StateType> {
	lastHtml: ?string;
	lastTitle: ?string;
	subscriptionParentGetHtml: ?EmitterSubscription;
	subscriptionParentToggleHTMLMode: ?EmitterSubscription;
	subscriptionParentSetTitle: ?EmitterSubscription;
	subscriptionParentUpdateHtml: ?EmitterSubscription;
	subscriptionParentSetFocusOnTitle: ?EmitterSubscription;
	postTitleRef: ?InputText;

	constructor( props: PropsType ) {
		super( props );

		( this: any ).onSafeAreaInsetsUpdate = this.onSafeAreaInsetsUpdate.bind( this );
		( this: any ).onRootViewLayout = this.onRootViewLayout.bind( this );

		const post = props.post || {
			id: 1,
			title: {
				raw: props.initialTitle,
			},
			content: {
				raw: props.initialHtml,
			},
			type: 'draft',
		};

		props.setupEditor( post );
		this.lastHtml = serialize( parse( props.initialHtml ) );
		this.lastTitle = props.initialTitle;

		if ( props.initialHtmlModeEnabled && props.mode === 'visual' ) {
			// enable html mode if the initial mode the parent wants it but we're not already in it
			this.toggleMode();
		}

		this.state = {
			rootViewHeight: 0,
			safeAreaBottomInset: 0,
			isFullyBordered: true,
		};

		SafeArea.getSafeAreaInsetsForRootView().then( this.onSafeAreaInsetsUpdate );
	}

	componentDidMount() {
		const blocks = this.props.blocks;
		const hasUnsupportedBlocks = ! isEmpty( blocks.filter( ( { name } ) => name === UnsupportedBlock.name ) );
		RNReactNativeGutenbergBridge.editorDidMount( hasUnsupportedBlocks );

		this.subscriptionParentGetHtml = subscribeParentGetHtml( () => {
			this.serializeToNativeAction();
		} );

		this.subscriptionParentToggleHTMLMode = subscribeParentToggleHTMLMode( () => {
			this.toggleMode();
		} );

		this.subscriptionParentSetTitle = subscribeSetTitle( ( payload ) => {
			this.props.editTitle( payload.title );
		} );

		this.subscriptionParentUpdateHtml = subscribeUpdateHtml( ( payload ) => {
			this.updateHtmlAction( payload.html );
		} );

		this.subscriptionParentSetFocusOnTitle = subscribeSetFocusOnTitle( () => {
			if ( this.postTitleRef ) {
				this.postTitleRef.focus();
			}
		} );

		SafeArea.addEventListener( 'safeAreaInsetsForRootViewDidChange', this.onSafeAreaInsetsUpdate );
	}

	componentWillUnmount() {
		if ( this.subscriptionParentGetHtml ) {
			this.subscriptionParentGetHtml.remove();
		}
		if ( this.subscriptionParentToggleHTMLMode ) {
			this.subscriptionParentToggleHTMLMode.remove();
		}
		if ( this.subscriptionParentSetTitle ) {
			this.subscriptionParentSetTitle.remove();
		}
		if ( this.subscriptionParentUpdateHtml ) {
			this.subscriptionParentUpdateHtml.remove();
		}
		if ( this.subscriptionParentSetFocusOnTitle ) {
			this.subscriptionParentSetFocusOnTitle.remove();
		}
		SafeArea.removeEventListener( 'safeAreaInsetsForRootViewDidChange', this.onSafeAreaInsetsUpdate );
	}

	serializeToNativeAction() {
		if ( this.props.mode === 'text' ) {
			this.updateHtmlAction( this.props.getEditedPostContent() );
		}

		const html = serialize( this.props.blocks );
		const title = this.props.title;

		const hasChanges = title !== this.lastTitle || html !== this.lastHtml;

		RNReactNativeGutenbergBridge.provideToNative_Html( html, title, hasChanges );

		this.lastTitle = title;
		this.lastHtml = html;
	}

	updateHtmlAction( html: string = '' ) {
		const parsed = parse( html );
		this.props.resetEditorBlocksWithoutUndoLevel( parsed );
	}

	toggleMode() {
		const { mode, switchMode } = this.props;
		switchMode( mode === 'visual' ? 'text' : 'visual' );
	}

	blockHolderBorderStyle() {
		return this.state.isFullyBordered ? styles.blockHolderFullBordered : styles.blockHolderSemiBordered;
	}

	onSafeAreaInsetsUpdate( result ) {
		const { safeAreaInsets } = result;
		if ( this.state.safeAreaBottomInset !== safeAreaInsets.bottom ) {
			this.setState( { safeAreaBottomInset: safeAreaInsets.bottom } );
		}
	}

	onRootViewLayout( event: LayoutChangeEvent ) {
		this.setHeightState( event );
		this.setBorderStyleState();
	}

	setHeightState( event: LayoutChangeEvent ) {
		const { height } = event.nativeEvent.layout;
		this.setState( { rootViewHeight: height }, sendNativeEditorDidLayout );
	}

	setBorderStyleState() {
		const isFullyBordered = ReadableContentView.isContentMaxWidth();
		if ( isFullyBordered !== this.state.isFullyBordered ) {
			this.setState( { isFullyBordered } );
		}
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
				focusedBorderColor={ styles.blockHolderFocused.borderColor } />
		);
	}

	renderHTML() {
		return (
			<Fragment>
				<HTMLTextInput { ...this.props } parentHeight={ this.state.rootViewHeight } />
			</Fragment>
		);
	}

	renderVisual() {
		const {
			blocks,
			isReady,
			resetEditorBlocks,
			resetEditorBlocksWithoutUndoLevel,
		} = this.props;

		if ( ! isReady ) {
			return null;
		}

		return (
			<BlockEditorProvider
				value={ blocks }
				onInput={ resetEditorBlocksWithoutUndoLevel }
				onChange={ resetEditorBlocks }
				settings={ null }
			>
				<BlockList
					header={ this.renderHeader() }
					isFullyBordered={ this.state.isFullyBordered }
					rootViewHeight={ this.state.rootViewHeight }
					safeAreaBottomInset={ this.state.safeAreaBottomInset }
				/>
			</BlockEditorProvider>
		);
	}

	render() {
		const {
			mode,
		} = this.props;

		return (
			<SafeAreaView style={ styles.container } onLayout={ this.onRootViewLayout }>
				{ mode === 'text' ? this.renderHTML() : this.renderVisual() }
			</SafeAreaView>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			__unstableIsEditorReady: isEditorReady,
			getEditorBlocks,
			getEditedPostAttribute,
			getEditedPostContent,
		} = select( 'core/editor' );
		const {
			getEditorMode,
		} = select( 'core/edit-post' );

		return {
			isReady: isEditorReady(),
			blocks: getEditorBlocks(),
			mode: getEditorMode(),
			title: getEditedPostAttribute( 'title' ),
			getEditedPostContent,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			editPost,
			setupEditor,
			resetEditorBlocks,
		} = dispatch( 'core/editor' );
		const {
			switchEditorMode,
		} = dispatch( 'core/edit-post' );

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
			setupEditor,
			switchMode( mode ) {
				switchEditorMode( mode );
			},
		};
	} ),
] )( AppContainer );
