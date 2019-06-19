/**
 * External dependencies
 */
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';
import transform from 'css-to-react-native-transform';

const schema = {
	type: 'object',
	properties: {
		platform: {
			type: 'string',
		},
	},
};

export default function( source ) {
	const options = getOptions( this );

	validateOptions( schema, options, 'react-native-sass-loader' );

	const result = transform( source );

	return `export default ${ JSON.stringify( result ) };`;
}
