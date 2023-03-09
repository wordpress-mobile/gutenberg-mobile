// Jetpack mocks
global.window.JP_CONNECTION_INITIAL_STATE = {};

jest.mock( './jetpack/projects/js-packages/config/src', () => ( {
	__esModule: true,
} ) );
