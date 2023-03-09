// Jetpack mocks
global.window.JP_CONNECTION_INITIAL_STATE = {};

jest.mock( './jetpack/projects/js-packages/config/src', () => ( {
	__esModule: true,
} ) );

jest.mock(
	'./jetpack/projects/js-packages/shared-extension-utils/index.js',
	() => ( {
		__esModule: true,
		...jest.requireActual(
			'./jetpack/projects/js-packages/shared-extension-utils/index.js'
		),
		getHostAppNamespace: jest.fn(),
	} )
);
