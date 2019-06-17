/* eslint-disable */
( function( blocks, editor, i18n, element ) {
	var el = element.createElement;
	var __ = i18n.__;
	var RichText = editor.RichText;

	blocks.registerBlockType( 'gutenberg-mobile/hello-world', {
		title: __( 'Hello World', 'gutenberg-mobile' ),
		icon: 'universal-access-alt',
		category: 'layout',

		attributes: {
			content: {
				type: 'array',
				source: 'children',
				selector: 'p',
			},
		},

		edit: function( props ) {
			var content = props.attributes.content;
			function onChangeContent( newContent ) {
				props.setAttributes( { content: newContent } );
			}

			return el(
				RichText,
				{
					tagName: 'p',
					className: props.className,
					onChange: onChangeContent,
					value: content,
				}
			);
		},

		save: function( props ) {
			return el( RichText.Content, {
				tagName: 'p', value: props.attributes.content,
			} );
		},
	} );
}(
	window.wp.blocks,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element
) );