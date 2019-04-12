/** @flow
 * @format */

/**
 * External dependencies
 */
import React from 'react';
import { type EmitterSubscription, LayoutChangeEvent, SafeAreaView } from 'react-native';
import RNReactNativeGutenbergBridge, {
	subscribeParentGetHtml,
	subscribeParentToggleHTMLMode,
	subscribeUpdateHtml,
	sendNativeEditorDidLayout,
} from 'react-native-gutenberg-bridge';
import SafeArea from 'react-native-safe-area';

/**
 * WordPress dependencies
 */
import { parse, serialize } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { ReadableContentView } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { BlockType } from '../store/types';
import styles from './style.scss';
import HTMLTextInput from '../components/html-text-input';
import VisualEditor from './VisualEditor';

type PropsType = {
	initialHtmlModeEnabled: boolean,
	initialTitle: string,
	initialHtml: string,
	isReady: boolean,
	resetEditorBlocksWithoutUndoLevel: Array<BlockType> => mixed,
	setupEditor: ( mixed, ?mixed ) => mixed,
	toggleEditorMode: ?string => mixed,
	mode: string,
	post: ?mixed,
	getEditorBlocks: () => Array<BlockType>,
	getEditedPostAttribute: ( string ) => string,
	getEditedPostContent: () => string,
	switchMode: string => mixed,
};

type StateType = {
	rootViewHeight: number,
	safeAreaBottomInset: number,
	isFullyBordered: boolean,
};

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
	subscriptionParentUpdateHtml: ?EmitterSubscription;
	_isMounted: boolean;

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
				raw: props.initialHtml || '',
			},
			type: 'draft',
		};

		props.setupEditor( post );

		this.lastHtml = serialize( parse( props.initialHtml || '' ) );
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
		this._isMounted = true;
		this.subscriptionParentGetHtml = subscribeParentGetHtml( () => {
			this.serializeToNativeAction();
		} );

		this.subscriptionParentToggleHTMLMode = subscribeParentToggleHTMLMode( () => {
			this.toggleMode();
		} );

		this.subscriptionParentUpdateHtml = subscribeUpdateHtml( ( payload ) => {
			this.updateHtmlAction( payload.html );
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
		if ( this.subscriptionParentUpdateHtml ) {
			this.subscriptionParentUpdateHtml.remove();
		}
		SafeArea.removeEventListener( 'safeAreaInsetsForRootViewDidChange', this.onSafeAreaInsetsUpdate );
		this._isMounted = false;
	}

	serializeToNativeAction() {
		if ( this.props.mode === 'text' ) {
			this.updateHtmlAction( this.props.getEditedPostContent() );
		}

		const html = serialize( this.props.getEditorBlocks() );
		const title = this.props.getEditedPostAttribute( 'title' );

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

	onSafeAreaInsetsUpdate( result ) {
		const { safeAreaInsets } = result;
		if ( this._isMounted && this.state.safeAreaBottomInset !== safeAreaInsets.bottom ) {
			this.setState( { safeAreaBottomInset: safeAreaInsets.bottom } );
		}
	}

	onRootViewLayout( event: LayoutChangeEvent ) {
		if ( this._isMounted ) {
			this.setHeightState( event );
			this.setBorderStyleState();
		}
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

	renderHTML() {
		return (
			<HTMLTextInput
				parentHeight={ this.state.rootViewHeight }
			/>
		);
	}

	renderVisual() {
		const {
			isReady,
		} = this.props;

		if ( ! isReady ) {
			return null;
		}

		return (
			<VisualEditor
				isFullyBordered={ this.state.isFullyBordered }
				rootViewHeight={ this.state.rootViewHeight }
				safeAreaBottomInset={ this.state.safeAreaBottomInset }
			/>
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
			mode: getEditorMode(),
			getEditorBlocks,
			getEditedPostAttribute,
			getEditedPostContent,
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setupEditor,
			resetEditorBlocks,
		} = dispatch( 'core/editor' );
		const {
			switchEditorMode,
		} = dispatch( 'core/edit-post' );

		return {
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
