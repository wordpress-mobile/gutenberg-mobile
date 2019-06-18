/**
 * External dependencies
 */
import { createWebpackConfig } from 'haul';

export default {
	webpack: createWebpackConfig( ( { platform } ) => ( {
		entry: `./index.js`,
		rules: [ {
			test: /\.scss$/,
			use: [
				'sass-loader', // compiles Sass to CSS, using Node Sass by default
			],
		} ],
		plugins: [
			[ 'module-resolver', {
				alias: {
					'^@wordpress/(.+)': 'gutenberg/packages/\\1',
				},
			} ],
		],
	} ) ),
};
