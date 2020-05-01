window.setTimeout( () => {
	const blockHTML = `%@`;

	// Setup the editor with the inserted block
	const post = window.wp.data.select( 'core/editor' ).getCurrentPost();
	window.wp.data.dispatch( 'core/editor' ).setupEditor( post, { content: blockHTML } );

	// Select the first block
	const blockEditorSelect = window.wp.data.select( 'core/block-editor' ) ||
        window.wp.data.select( 'core/editor' ); // For WP v5.0 and v5.1
	const blockEditorDispatch = window.wp.data.dispatch( 'core/block-editor' ) ||
		window.wp.data.dispatch( 'core/editor' ); // For WP v5.0 and v5.1

	const clientId = blockEditorSelect.getBlocks()[ 0 ].clientId;
	blockEditorDispatch.selectBlock( clientId );
}, 0 );
