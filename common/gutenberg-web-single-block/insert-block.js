window.setTimeout( () => {
	const blockHTML = `%@`;
	const blocks = window.wp.blocks.parse( blockHTML );
	const blockEditor = window.wp.data.dispatch( 'core/block-editor' ) ||
        window.wp.data.dispatch( 'core/editor' ); // For WP v5.0 and v5.1
	blockEditor.resetBlocks( blocks );
	blockEditor.selectBlock( blocks[ 0 ].clientId );
	window.webkit.messageHandlers.log.postMessage( 'Block inserted' );
}, 0 );
