// Jetpack mocks

// Copied from https://github.com/Automattic/jetpack/blob/trunk/projects/js-packages/connection/jest.setup.js
global.window.JP_CONNECTION_INITIAL_STATE = {
	userConnectionData: {
		currentUser: {
			wpcomUser: {
				Id: 99999,
				login: 'bobsacramento',
				display_name: 'Bob Sacrmaneto',
			},
		},
	},
};

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

// The module `yjs` throws an error if it's imported more than once.
// This module is only used in the `@wordpress/sync` package which is not used
// by the native version. Due to the nature of some of the tests and the need to
// re-importing modules, we have to explicitly mock the module to avoid disruptions
// when running tests.
// Reference: https://t.ly/w4zVe
jest.mock( 'yjs' );
