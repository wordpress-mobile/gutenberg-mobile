/**
 * External dependencies
 */
import { AppRegistry } from 'react-native';
import { initializeEditor, render } from 'test/helpers';

/**
 * WordPress dependencies
 */
import '@wordpress/jest-console';

/**
 * Internal dependencies
 */
import initAnalytics from '../analytics';
import jetpackEditorSetup from '../jetpack-editor-setup';
import blockExperimentsSetup from '../block-experiments-setup';
import registerGutenbergMobile from '../';
import { getTranslation as getGutenbergTranslation } from '../i18n-cache/gutenberg';
import { getTranslation as getJetpackTranslation } from '../i18n-cache/jetpack';
import { getTranslation as getLayoutGridTranslation } from '../i18n-cache/layout-grid';

jest.mock( 'react-native/Libraries/ReactNative/AppRegistry' );
jest.mock( '../analytics' );
jest.mock( '../jetpack-editor-setup' );
jest.mock( '../block-experiments-setup' );

// Use an empty editor component to prevent rendering the editor.
jest.mock( '@wordpress/react-native-editor/src/setup', () => ( {
	__esModule: true,
	default: jest.fn().mockReturnValue( <></> ),
} ) );

const defaultLocale = 'en-gb';
const setupLocaleLogs = [
	[ 'locale', defaultLocale, getGutenbergTranslation( defaultLocale ) ],
	[
		'jetpack - locale',
		defaultLocale,
		getJetpackTranslation( defaultLocale ),
	],
	[
		'layout-grid - locale',
		defaultLocale,
		getLayoutGridTranslation( defaultLocale ),
	],
];

const getEditorComponent = () => {
	let EditorComponent;
	AppRegistry.registerComponent.mockImplementation(
		( name, componentProvider ) => {
			EditorComponent = componentProvider();
		}
	);
	registerGutenbergMobile();
	return EditorComponent;
};

describe( 'Gutenberg Mobile initialization', () => {
	describe( 'setup', () => {
		beforeEach( () => {
			const EditorComponent = getEditorComponent();
			render(
				<EditorComponent locale={ defaultLocale } translations={ {} } />
			);
		} );

		it( 'initializes analytics', () => {
			expect( initAnalytics ).toBeCalled();
			setupLocaleLogs.forEach( ( log ) =>
				expect( console ).toHaveLoggedWith( ...log )
			);
		} );

		it( 'sets up Jetpack', () => {
			expect( jetpackEditorSetup ).toBeCalled();
			setupLocaleLogs.forEach( ( log ) =>
				expect( console ).toHaveLoggedWith( ...log )
			);
		} );

		it( 'sets up block experiments', () => {
			expect( blockExperimentsSetup ).toBeCalled();
			setupLocaleLogs.forEach( ( log ) =>
				expect( console ).toHaveLoggedWith( ...log )
			);
		} );
	} );

	describe( 'editor rendering', () => {} );

	it( 'renders the editor', () => {
		// Unmock setup module to render the actual editor component.
		jest.unmock( '@wordpress/react-native-editor/src/setup' );

		const capabilities = {
			mediaFilesCollectionBlock: true,
			contactInfoBlock: true,
			facebookEmbed: true,
			instagramEmbed: true,
			loomEmbed: true,
			smartframeEmbed: true,
		};

		const EditorComponent = getEditorComponent();
		const screen = initializeEditor(
			{ locale: defaultLocale, capabilities },
			{ component: EditorComponent }
		);
		const blockList = screen.getByTestId( 'block-list-wrapper' );

		expect( blockList ).toBeDefined();
		expect( console ).toHaveLoggedWith( 'Hermes is: true' );
		setupLocaleLogs.forEach( ( log ) =>
			expect( console ).toHaveLoggedWith( ...log )
		);
		// It's expected that some blocks are upgraded and inform about it (example: "Updated Block: core/cover")
		expect( console ).toHaveInformed();
	} );
} );
