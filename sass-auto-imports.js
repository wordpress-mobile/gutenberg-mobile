/**
 * External dependencies
 */
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';

const schema = {
	type: 'object',
	properties: {
		files: {
			type: 'array',
		},
	},
};

export default function( source ) {
	const options = getOptions( this );

	validateOptions( schema, options, 'react-native-sass-loader' );

	// const imports = options.files.map( ( file ) => `@import "${ file }";` ).join( '\n' );
	const imports = options.files.reduce( ( result, file ) => result + `@import "${ file }";\n`, '' );

	return imports + '\n' + source;
}
