/**
 * @format
 * @flow
 */

// Gutenberg imports
import { registerCoreBlocks } from '@gutenberg/core-blocks';
import { parse } from '@gutenberg/blocks';

import { createStore } from 'redux';
import { reducer } from './reducers';

export type BlockType = {
	uid: string,
	name: string,
	isValid: boolean,
	attributes: Object,
	innerBlocks: Array<BlockType>,
	focused: boolean,
};

export type StateType = {
	blocks: Array<BlockType>,
	refresh: boolean,
};

registerCoreBlocks();

const initialCodeBlockHtml = `
<!-- wp:code -->
<pre class="wp-block-code"><code>if name == "World":
    return "Hello World"
else:
    return "Hello Pony"</code></pre>
<!-- /wp:code -->
`;

const initialMoreBlockHtml = `
<!-- wp:more -->
<!--more-->
<!-- /wp:more -->
`;

const initialParagraphBlockHtml = '<!-- wp:paragraph --><p><b>Hello</b> World!</p><!-- /wp:paragraph -->';
const initialParagraphBlockHtml2 = `<!-- wp:paragraph {"dropCap":true,"backgroundColor":"vivid-red","fontSize":"large","className":"classe-aggiuntiva-1 classe-aggiuntiva-2"} -->
<p class="has-background has-drop-cap is-large-text has-vivid-red-background-color classe-aggiuntiva-1 classe-aggiuntiva-2">
This is the content of para blog</p><!-- /wp:paragraph -->`;

const codeBlockInstance = parse( initialCodeBlockHtml )[ 0 ];
const moreBlockInstance = parse( initialMoreBlockHtml )[ 0 ];
const paragraphBlockInstance = parse( initialParagraphBlockHtml )[ 0 ];
const paragraphBlockInstance2 = parse( initialParagraphBlockHtml2 )[ 0 ];

const initialState: StateType = {
	// TODO: get blocks list block state should be externalized (shared with Gutenberg at some point?).
	// If not it should be created from a string parsing (commented HTML to json).
	blocks: [
		{
			uid: '1',
			name: 'title',
			isValid: true,
			attributes: {
				content: 'Hello World',
			},
			innerBlocks: [],
			focused: false,
		},
		{ ...paragraphBlockInstance, focused: false },
		{ ...paragraphBlockInstance2, focused: false },
		{ ...codeBlockInstance, focused: false },
		{ ...moreBlockInstance, focused: false },
	],
	refresh: false,
};

const devToolsEnhancer =
	( 'development' === process.env.NODE_ENV && require( 'remote-redux-devtools' ).default ) ||
	( () => {} );

export function setupStore( state: StateType = initialState ) {
	const store = createStore( reducer, state, devToolsEnhancer() );
	return store;
}
