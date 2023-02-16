import path from 'path';
import { dangerReassure } from 'reassure';

dangerReassure( {
	inputFilePath: path.join( __dirname, 'gutenberg/.reassure/output.md' ),
} );
