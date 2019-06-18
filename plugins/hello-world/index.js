/* eslint-disable */
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

registerBlockType( 'gutenberg-mobile/hello-world', {
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

  edit: ( props ) => {
    var content = props.attributes.content;
    function onChangeContent( newContent ) {
      props.setAttributes( { content: newContent } );
    }

    return (
      <RichText
      tagName={ 'p' }
      className={ props.className }
      onChange={ onChangeContent }
      value={ content }
      />
    );
  },

  save: ( props ) => {
    return (
      <RichText.Content
      tagName={ 'p' }
      value={ props.attributes.content }
      />
    );
  },
} );
