/**
 * External dependencies
 */
import { Text } from 'react-native';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { StarBlockIcon } from './icon';

export const name = 'rating-star';

export const settings = {
	title: __( 'Star Rating', 'extra' ),
	description: __(
		'Rate movies, books, songs, recipes — anything you can put a number on.',
		'extra'
	),
	icon: StarBlockIcon,
	keywords: [
		_x( 'star', 'block search term', 'extra' ),
		_x( 'rating', 'block search term', 'extra' ),
		_x( 'review', 'block search term', 'extra' ),
	],
	category: 'extra',
	example: {},
	attributes: {},
	edit: () => <Text>{ '⭐⭐⭐⭐⭐' }</Text>,
	save: () => '⭐⭐⭐⭐⭐',
};
