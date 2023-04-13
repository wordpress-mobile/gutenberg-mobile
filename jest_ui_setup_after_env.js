/**
 * Internal dependencies
 */
const {
	isAndroid,
} = require( './gutenberg/packages/react-native-editor/__device-tests__/helpers/utils' );

// eslint-disable-next-line import/no-extraneous-dependencies
const { configureToMatchImageSnapshot } = require( 'jest-image-snapshot' );

const toMatchImageSnapshot = configureToMatchImageSnapshot( {
	comparisonMethod: 'ssim',
	failureThreshold: 0.01, // 1% threshold.
	failureThresholdType: 'percent',
	dumpInlineDiffToConsole: true,
	runInProcess: true,
	customSnapshotIdentifier( data ) {
		return `${ data.defaultIdentifier }-${
			isAndroid() ? 'android' : 'ios'
		}`;
	},
	customSnapshotsDir: '__device-tests__/image-snapshots',
	customDiffDir: '__device-tests__/image-snapshots/diff',
} );
expect.extend( { toMatchImageSnapshot } );
