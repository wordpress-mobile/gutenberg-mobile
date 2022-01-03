/**
 * External dependencies
 */
// eslint-disable-next-line import/named
import { AppRegistry } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { render, waitFor } from 'test/helpers';

/**
 * Internal dependencies
 */
import initAnalytics from '../analytics';
import jetpackEditorSetup from '../jetpack-editor-setup';
import blockExperimentsSetup from '../block-experiments-setup';

jest.mock( 'react-native/Libraries/ReactNative/AppRegistry' );
jest.mock( '../analytics' );
jest.mock( '../jetpack-editor-setup' );
jest.mock( '../block-experiments-setup' );

// Use an empty editor component to prevent rendering the editor.
jest.mock( '@wordpress/react-native-editor/src/setup', () => ( {
	__esModule: true,
	default: jest.fn().mockReturnValue( <></> ),
} ) );

const initialProps = { initialData: '', capabilities: {} };

const initGutenbergMobile = ( props = initialProps ) => {
	let EditorComponent;
	AppRegistry.registerComponent.mockImplementation(
		( name, componentProvider ) => {
			EditorComponent = componentProvider();
		}
	);
	jest.isolateModules( () => {
		// Import entry point to initialize the editor
		require( '../index' );
	} );
	return render( <EditorComponent { ...props } /> );
};

describe( 'Gutenberg Mobile initialization', () => {
	it( 'initializes analytics', () => {
		initGutenbergMobile();
		expect( initAnalytics ).toBeCalled();
	} );

	it( 'sets up Jetpack', () => {
		initGutenbergMobile();
		expect( jetpackEditorSetup ).toBeCalled();
	} );

	it( 'sets up block experiments', () => {
		initGutenbergMobile();
		expect( blockExperimentsSetup ).toBeCalled();
	} );

	it( 'initializes the editor', () => {
		// Unmock setup module to render the actual editor component.
		jest.unmock( '@wordpress/react-native-editor/src/setup' );

		const { getByTestId } = initGutenbergMobile();
		const blockList = waitFor( () => getByTestId( 'block-list-wrapper' ) );
		expect( blockList ).toBeDefined();
	} );
} );
