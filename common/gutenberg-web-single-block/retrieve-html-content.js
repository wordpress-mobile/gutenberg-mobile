window.getHTMLPostContent = () => {
	const blockEditor = window.wp.data.select( 'core/block-editor' ) ||
        window.wp.data.select( 'core/editor' ); // For WP v5.0 and v5.1
	const blocks = blockEditor.getBlocks();
	const HTML = window.wp.blocks.serialize( blocks );
	window.webkit.messageHandlers.htmlPostContent.postMessage( HTML );
};

