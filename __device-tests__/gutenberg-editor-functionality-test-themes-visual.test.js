/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { setThemeJSONFromClipboard, isAndroid } = e2eUtils;
import { fetchTheme, takeScreenshot } from './utils';

const THEMES = [
	{ name: 'stewart' },
	{ name: 'pixl' },
	{ name: 'masu' },
	{ name: 'twentytwentythree', isWordPressTheme: true },
];

describe( 'Block-based themes', () => {
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
		'$name renders colors and font-size for paragraph and heading blocks',
		async ( currentTheme ) => {
			// Set theme
			await setThemeJSONFromClipboard(
				editorPage.driver,
				THEMES_DATA[ currentTheme.name ]
			);

			await editorPage.addNewBlock( blockNames.paragraph );
			const paragraphBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.paragraph
			);
			await editorPage.typeTextToTextBlock(
				paragraphBlockElement,
				e2eTestData.mediumText
			);

			const titleElement = await editorPage.getTitleElement();
			await titleElement.click();
			await editorPage.dismissKeyboard();

			// Visual test check
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Remove block
			const paragraphBlock = await editorPage.getBlockAtPosition(
				blockNames.paragraph
			);
			await paragraphBlock.click();
			await editorPage.removeBlock();

			// Add Heading blockº
			await editorPage.addNewBlock( blockNames.heading );

			const headingBlockElement = await editorPage.getTextBlockAtPosition(
				blockNames.heading
			);
			await editorPage.typeTextToTextBlock(
				headingBlockElement,
				e2eTestData.shortText
			);

			// Test Heading block level 1
			await changeHeadingLevel( 1 );

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Test Heading block level 2
			await headingBlockElement.click();
			await changeHeadingLevel( 2 );

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Test Heading block level 3
			await headingBlockElement.click();
			await changeHeadingLevel( 3 );

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Test Heading block level 4
			await headingBlockElement.click();
			await changeHeadingLevel( 4 );

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			// Remove blocks
			await headingBlockElement.click();
			await editorPage.removeBlock();
		}
	);

	test.each( THEMES )(
		'$name renders colors and font-size for a list block',
		async ( currentTheme ) => {
			// Set theme
			await setThemeJSONFromClipboard(
				editorPage.driver,
				THEMES_DATA[ currentTheme.name ]
			);

			await editorPage.addNewBlock( blockNames.list );
			let listItemBlockElement = await editorPage.getListItemBlockTextInputAtPosition();
			await editorPage.typeTextToTextBlock(
				listItemBlockElement,
				e2eTestData.shortText + '\n',
				false
			);

			listItemBlockElement = await editorPage.getListItemBlockTextInputAtPosition(
				2
			);
			await editorPage.typeTextToTextBlock(
				listItemBlockElement,
				e2eTestData.listItem1 + '\n',
				false
			);

			listItemBlockElement = await editorPage.getListItemBlockTextInputAtPosition(
				3
			);
			await editorPage.typeTextToTextBlock(
				listItemBlockElement,
				e2eTestData.listItem2
			);

			let titleElement = await editorPage.getTitleElement();
			await titleElement.click();
			await editorPage.dismissKeyboard();

			// Visual test check
			let screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await selectListBlock();

			// Change font-size
			await editorPage.openBlockSettings();
			const fontSizeLocator = isAndroid()
				? 'Custom, Navigates to select Custom'
				: 'Custom';
			const fontSizeButton = await editorPage.waitForElementToBeDisplayedById(
				fontSizeLocator
			);
			await fontSizeButton.click();

			// Wait for screen transition
			await editorPage.driver.sleep( 2000 );

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			const fontSizeElementLocator = isAndroid()
				? '//android.widget.Button[5][contains(@content-desc, "Double tap to select font size")]'
				: '//XCUIElementTypeOther[starts-with(@name, "Selected")]//XCUIElementTypeButton[5]';
			const newFontSizeElement = await editorPage.waitForElementToBeDisplayedByXPath(
				fontSizeElementLocator
			);
			await newFontSizeElement.click();

			// Wait for new font to be re-rendered
			await editorPage.driver.sleep( 2000 );

			await editorPage.dismissBottomSheet();

			// Wait for the modal to close
			await editorPage.driver.sleep( 3000 );

			titleElement = await editorPage.getTitleElement();
			await titleElement.click();
			await editorPage.dismissKeyboard();

			// Visual test check
			screenshot = await takeScreenshot();
			expect( screenshot ).toMatchImageSnapshot();

			await selectListBlock();
			await editorPage.removeBlock();
		}
	);
} );

async function changeHeadingLevel( level ) {
	const changeHeadingLevelButton = await editorPage.waitForElementToBeDisplayedById(
		'Change heading level'
	);
	await changeHeadingLevelButton.click();

	const headingLevelButton = await editorPage.waitForElementToBeDisplayedById(
		`Heading ${ level }`
	);
	await headingLevelButton.click();

	// Wait for font to be re-rendered
	await editorPage.driver.sleep( 2000 );

	const titleElement = await editorPage.getTitleElement( {
		autoscroll: true,
	} );
	await titleElement.click();

	// Wait for the scrollbar to hide
	await editorPage.driver.sleep( 3000 );
	await editorPage.dismissKeyboard();
}

async function selectListBlock() {
	const listBlockElement = await editorPage.getBlockAtPosition(
		blockNames.list
	);
	await listBlockElement.click();

	editorPage.moveBlockSelectionUp();
	await editorPage.driver.sleep( 2000 );
}
