/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
import { takeScreenshot, fetchTheme } from './utils';

const THEMES = [
	{ name: 'didone' },
	{ name: 'organizer' },
	{ name: 'montagna' },
	{ name: 'twentytwentythree', isWordPressTheme: true },
];

describe( 'Gutenberg Editor Visual test for Block Themes', () => {
	const THEMES_DATA = {};

	beforeAll( async () => {
		for ( const theme of THEMES ) {
			try {
				const themeData = await fetchTheme( theme );
				THEMES_DATA[ theme.name ] = themeData;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error(
					`Failed to fetch data for theme ${ theme.name }:`,
					error
				);
			}
		}
	} );

	test.each( THEMES )(
		'$name renders default placeholder correctly',
		async ( currentTheme ) => {
			const themeData = THEMES_DATA[ currentTheme.name ];

			await editorPage.initializeEditor( {
				...themeData,
			} );

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		}
	);

	test.each( THEMES )(
		'$name renders different blocks correctly',
		async ( currentTheme ) => {
			const themeData = THEMES_DATA[ currentTheme.name ];

			await editorPage.initializeEditor( {
				...themeData,
				initialData: `
                <!-- wp:paragraph -->
                <p>The finer <a href="http://wordpress.org">continuum interprets</a> the polynomial rabbit. When can the geology runs? An astronomer runs. Should a communist consent?</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"var:preset|color|tertiary"}}}},"backgroundColor":"primary","textColor":"tertiary"} -->
                <p class="has-tertiary-color has-primary-background-color has-text-color has-background has-link-color">Custom color</p>
                <!-- /wp:paragraph -->
                <!-- wp:buttons -->
                <div class="wp-block-buttons"><!-- wp:button -->
                <div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Button 1</a></div>
                <!-- /wp:button -->
                <!-- wp:button -->
                <div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Button 2</a></div>
                <!-- /wp:button --></div>
                <!-- /wp:buttons -->`,
			} );

			await editorPage.addNewBlock( blockNames.heading );
			const headingBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.heading,
				4
			);

			await editorPage.typeTextToTextBlock(
				headingBlockElement,
				e2eTestData.shortText
			);

			const titleElement = await editorPage.getTitleElement( {
				autoscroll: true,
			} );
			await titleElement.click();

			await editorPage.dismissKeyboard();

			// Wait for scrollbars to hide
			await editorPage.driver.pause( 3000 );

			// Visual test check
			const screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();
		}
	);
} );
