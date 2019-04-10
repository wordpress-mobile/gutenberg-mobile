
/** @format */

/**
 * External dependencies
 */
import renderer from 'react-test-renderer';

/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { bootstrapEditor } from '..';
import App from './App';
import BlockEdit from '@wordpress/block-editor';

describe( 'App', () => {
	beforeAll( bootstrapEditor );

	it( 'renders without crashing', () => {
		const app = renderer.create( <App /> );
		const rendered = app.toJSON();
		expect( rendered ).toBeTruthy();
		app.unmount();
	} );

	it( 'renders without crashing with a block focused', () => {
		const app = renderer.create( <App /> );
		const blocks = select( 'core/block-editor' ).getBlocks();
		dispatch( 'core/block-editor' ).selectBlock( blocks[ 0 ].clientId );
		const rendered = app.toJSON();
		expect( rendered ).toBeTruthy();
		app.unmount();
	} );

	it( 'Code block is a TextInput', () => {
		const app = renderer.create( <App /> );

		app.root.findAllByType( BlockEdit )
			.forEach( ( blockEdit ) => {
				if ( 'core/code' === blockEdit.props.name ) {
					// TODO: hardcoded indices are ugly and error prone. Can we do better here?
					const blockEditContainer = blockEdit.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ];
					const contentComponent = blockEditContainer.children[ 0 ];
					const inputComponent =
						contentComponent.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ]
							.children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ].children[ 0 ];

					expect( inputComponent.type ).toBe( 'TextInput' );
				}
			} );

		app.unmount();
	} );

	it( 'Heading block test', () => {
		const app = renderer.create( <App /> );
		app.root.findAllByType( BlockEdit )
			.forEach( ( blockEdit ) => {
				if ( 'core/heading' === blockEdit.props.name ) {
					const aztec = blockEdit.findByType( 'RCTAztecView' );
					expect( aztec.props.text.text ).toBe( '<h2>What is Gutenberg?</h2>' );
				}
			} );
		app.unmount();
	} );
} );
