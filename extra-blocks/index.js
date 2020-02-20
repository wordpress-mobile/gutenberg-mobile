

/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { getCategories, setCategories } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import * as ratingStar from './rating-star';

export const extraBlocks = [
	ratingStar
];

export const addExtraCategory = () => (
	setCategories( [
		...getCategories().filter( ( { slug } ) => slug !== 'extra' ),
		// Add a new block category
		{
			slug: 'extra',
			title: 'Extra blocks',
		},
	] )
);

let blocksRegistered = false;

export const registerAll = () => {
	if ( blocksRegistered ) {
		return;
	}

	addExtraCategory();

	extraBlocks.forEach( () => registerBlockType( `extra/${ ratingStar.name }`, ratingStar.settings ) );

	blocksRegistered = true;
};
