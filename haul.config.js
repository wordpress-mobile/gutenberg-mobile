/**
 * External dependencies
 */
import { createWebpackConfig } from 'haul';
import merge from 'webpack-merge';
import path from 'path';

const gutenbergPackages = ( () => {
	const dependencies = require( './gutenberg/package' ).dependencies;
	return Object.keys( dependencies ).reduce( ( memo, module ) => {
		memo[ module ] = path.resolve( dependencies[ module ].replace( /^file:/, 'gutenberg/' ) );
		return memo;
	}, {} );
} )();

export default {
	webpack: ( env ) => {
		const { platform } = env;
		// Hot reloading wraps components in a proxy component
		// breaking Gutenberg's serialization.
		env.disableHotReloading = true;
		const defaultConfig = createWebpackConfig( {
			entry: `./index.js`,
		} )( env );

		const config = merge(
			defaultConfig,
			{
				module: {
					rules: [
						{
							test: /\.js?$/,
              use: [ 'babel-loader' ],
						},
						{
							test: /\.js?$/,
              use: [ 'source-map-loader' ],
              enforce: 'pre'
						},
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
						...gutenbergPackages,
						'react-native-aztec': path.resolve( 'react-native-aztec' ),
						'react-native-gutenberg-bridge': path.resolve( 'react-native-gutenberg-bridge' ),
					},
				},
			}
		);
		return config;
	},
};
