/**
 * External dependencies
 */
import { makeConfig, withPolyfills } from '@haul-bundler/preset-0.60';
import path from 'path';

const gutenbergPackages = ( () => {
	const dependencies = require( './gutenberg/package' ).dependencies;
	return Object.keys( dependencies ).reduce( ( memo, module ) => {
		memo[ module ] = path.resolve( dependencies[ module ].replace( /^file:/, 'gutenberg/' ) );
		return memo;
	}, {} );
} )();

export default makeConfig( {
	bundles: {
		index: {
			entry: withPolyfills( './index.js' ),
			transform( { env, config } ) {
				const { platform } = env;

				config.module.rules = [
					...config.module.rules,
					{
						test: /\.js$/,
						use: [ 'source-map-loader' ],
						enforce: 'pre',
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
				];

				config.resolve.alias = {
					...config.resolve.alias,
					...gutenbergPackages,
					'react-native-aztec': path.resolve( 'react-native-aztec' ),
					'react-native-gutenberg-bridge': path.resolve( 'react-native-gutenberg-bridge' ),
				};
			},
		},
	},
} );
