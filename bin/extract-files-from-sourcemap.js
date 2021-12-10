#!/usr/bin/env node
/**
 *
 * Extracts and copies the source files referenced in a source-map file to a target directory.
 *
 */

const fs = require( 'fs' );
const path = require( 'path' );

const copyFileToDir = ( filePath, targetDir ) => {
	const fileDir = path.dirname( filePath );
	const newDir = path.join( targetDir, fileDir );
	const newFilePath = path.join( newDir, path.basename( filePath ) );

	fs.mkdirSync( newDir, { recursive: true } );
	fs.copyFileSync( filePath, newFilePath );
};

if ( require.main === module ) {
	const mapFile = process.argv[ 2 ];
	const targetDir = process.argv[ 3 ];

	// Validate arguments
	if ( ! mapFile ) {
		console.error( `Map file argument is required.` );
		process.exit( 1 );
	}
	if ( ! targetDir ) {
		console.error( `Target directory argument is required.` );
		process.exit( 1 );
	}
	try {
		fs.accessSync( mapFile );
	} catch ( err ) {
		console.error( `Map file "${ mapFile } doesn't exist.` );
		process.exit( 1 );
	}
	try {
		fs.accessSync( targetDir );
	} catch ( err ) {
		console.error( `Target directory "${ targetDir }"" doesn't exist.` );
		process.exit( 1 );
	}

	// Get source files from sourcemap file
	const mapFileData = fs.readFileSync( mapFile );
	const { sources } = JSON.parse( mapFileData );

	// Transform absolute paths into relative
	const currentPath = process.cwd();
	let sourceFiles = sources.map( ( file ) =>
		file.replace( currentPath, '.' )
	);

	// Filter out files under "node_modules" folder
	sourceFiles = sourceFiles.filter(
		( file ) => file.indexOf( 'node_modules' ) === -1
	);

	// Only include source code and JSON files
	sourceFiles = sourceFiles.filter( ( file ) =>
		[ '.js', '.json', '.ts' ].includes( path.extname( file ) )
	);

	// Filter out unexisting files
	sourceFiles = sourceFiles.filter( ( file ) => {
		try {
			fs.accessSync( file );
			return true;
		} catch ( error ) {
			return false;
		}
	} );

	// Use compiled files for Typescript files (only Gutenberg)
	sourceFiles = sourceFiles.map( ( file ) => {
		if (
			// For now, only check files under Gutenberg
			file.startsWith( './gutenberg' ) != -1 &&
			file.indexOf( 'node_modules' ) === -1 &&
			file.endsWith( '.ts' )
		) {
			const compiledFile = file
				.replace( 'src', 'build' )
				.replace( '.ts', '.js' );
			try {
				fs.accessSync( compiledFile );
			} catch ( error ) {
				console.warn(
					`Couldn't find matching build file for Typescript file "${ compiledFile }".`
				);
				return file;
			}

			console.log(
				`Using compiled file "${ compiledFile }" for Typescript file ${ file }`
			);
			return compiledFile;
		}
		return file;
	} );

	// Copy source files to target directory
	try {
		sourceFiles.forEach( ( sourceFile ) =>
			copyFileToDir( sourceFile, targetDir )
		);
	} catch ( error ) {
		console.error(
			'Something went wrong when copying source files to tmp dir:',
			error
		);
	}
}
