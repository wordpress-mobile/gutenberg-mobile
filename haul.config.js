/**
 * External dependencies
 */
import { createWebpackConfig } from 'haul';
import merge from 'webpack-merge';
import path from 'path';

export default {
	webpack: ( env ) => {
		const { platform } = env;
		const defaultConfig = createWebpackConfig( {
			entry: `./index.js`,
		} )( env );

		const config = merge(
			defaultConfig,
			{
				module: {
					rules: [
						{
							test: /\.scss$/,
							use: [
								{
									loader: path.resolve( 'webpack-react-native-sass-loader.js' ),
									options: {
										platform,
									},
								},
								{
									loader: 'sass-loader',
									options: {
										includePaths: [
											path.resolve( 'src' ),
											path.resolve( 'gutenberg/assets/stylesheets' ),
										],
									},
								},
								{
									loader: path.resolve( 'sass-auto-imports.js' ),
									options: {
										files: [
											'_colors.scss',
											'_breakpoints.scss',
											'_variables.scss',
											platform === 'android' ? '_native.android.scss' : '_native.ios.scss',
											'_mixins.scss',
											'_animations.scss',
											'_z-index.scss',
										],
									},
								},
							],
						},
					],
				},
				resolve: {
					alias: {
						'^@wordpress/(.+)': 'gutenberg/packages/\\1',
						'react-native-gutenberg-bridge': path.resolve( 'react-native-gutenberg-bridge' ),
					},
				},
			}
		);
		return config;
	},
};
