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
