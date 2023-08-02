const fs = require( 'fs' );
const https = require( 'https' );
const path = require( 'path' );
const os = require( 'os' );
const readline = require( 'readline' );
// eslint-disable-next-line import/no-extraneous-dependencies
const { SourceMapConsumer } = require( 'source-map' );
const Symbolication = require( '../node_modules/metro-symbolicate/src/Symbolication' );

const TEMP_DIR = os.tmpdir();
const SOURCE_MAP_FILES = {
	bytecode: 'App.js.map',
	javascript: 'App.text.js.map',
};

// Helpers
const downloadSourceMap = async ( platform, version, type ) => {
	const sourceMapFile = SOURCE_MAP_FILES[ type ];
	const sourceMapUrl = `https://github.com/wordpress-mobile/gutenberg-mobile/releases/download/v${ version }/${ platform.toLowerCase() }-${ sourceMapFile }`;

	const tempFilePath = path.join( TEMP_DIR, `temp_${ Date.now() }.tmp` );
	const file = fs.createWriteStream( tempFilePath );

	const download = ( url ) =>
		new Promise( ( resolve, reject ) =>
			https.get( url, ( response ) => {
				if ( response.statusCode === 302 ) {
					// Following a redirection
					download( response.headers.location )
						.then( resolve )
						.catch( reject );
					return;
				} else if ( response.statusCode !== 200 ) {
					const errorMessage = `Failed to download file ${ url } (Status Code: ${ response.statusCode })`;
					response.resume(); // Consume the response data to free up memory
					reject( errorMessage );
					return;
				}

				response.pipe( file );

				file.on( 'finish', () => {
					file.close();
					resolve( tempFilePath );
				} );

				file.on( 'error', ( err ) => {
					fs.unlink( tempFilePath, () => reject( err ) );
				} );
			} )
		);

	return download( sourceMapUrl );
};

const parseEntry = ( entry ) => {
	const matchResult = entry.match( /\@(\d+)\:(\d+)/ );
	if ( ! matchResult || matchResult.length !== 3 ) {
		console.error( `\x1b[31mError parsing entry: ${ entry }\x1b[0m` );
		return;
	}
	return { line: matchResult[ 1 ], column: matchResult[ 2 ] };
};

const getPositionFromContext = ( { line, column }, context ) => {
	return Symbolication.getOriginalPositionFor( line, column, null, context );
};

const getSymbolicationContext = async ( platform, version, type ) => {
	try {
		const sourceMapFile = await downloadSourceMap(
			platform,
			version,
			type
		);
		const sourceMap = await fs.promises.readFile( sourceMapFile, 'utf8' );
		const context = Symbolication.createContext(
			SourceMapConsumer,
			sourceMap,
			{
				nameSource: 'function_names',
				inputLineStart: 1,
				inputColumnStart: 0,
				outputLineStart: 1,
				outputColumnStart: 0,
			}
		);
		await fs.promises.unlink( sourceMapFile );
		return context;
	} catch ( exception ) {
		console.warn(
			`\x1b[33mCouldn't create symbolication context for ${ type } using source map '${ SOURCE_MAP_FILES[ type ] }'.\x1b[0m`
		);
		return;
	}
};

const getSymbolicationContexts = async ( platform, version ) => {
	console.log(
		`Downloading source maps for ${ version } - ${ platform }...`
	);
	const bytecodeContext = await getSymbolicationContext(
		platform,
		version,
		'bytecode'
	);
	const jsContext = await getSymbolicationContext(
		platform,
		version,
		'javascript'
	);

	if ( ! bytecodeContext && ! jsContext ) {
		console.error(
			`\x1b[31mSource maps for ${ platform } ${ version } couldn't be fetched.\nReview that they are attached to the GitHub release: https://github.com/wordpress-mobile/gutenberg-mobile/releases/tag/v${ version }.\x1b[0m`
		);
		process.exit( 1 );
		return;
	}

	// In case the version is not using Hermes, the bytecode source map
	// will actually be the javascript source map.
	if ( ! jsContext ) {
		console.warn(
			'\x1b[33mSeems the version is not using Hermes, so only the javascript source map will be used.\x1b[0m'
		);
		return { jsContext: bytecodeContext };
	} else {
		return { bytecodeContext, jsContext };
	}
};

const askArgument = ( question, { multiline } = {} ) =>
	new Promise( ( resolve, reject ) => {
		const rl = readline.createInterface( {
			input: process.stdin,
			output: process.stdout,
		} );

		if ( multiline ) {
			let input = [];
			console.log( `${ question }: ` );
			console.log( '(type enter in an empty line to continue)' );
			rl.prompt();

			rl.on( 'line', ( line ) => {
				if ( line.trim() === '' ) {
					rl.close();
				} else {
					input.push( line );
				}
			} );

			rl.on( 'close', () => {
				resolve( input.join( '\n' ) );
			} );
		} else {
			rl.question( `${ question }: `, ( answer ) => {
				resolve( answer );
				rl.close();
			} );
		}
	} );

const getArguments = async () => {
	let notEnoughArgs = false;
	const platform =
		process.argv[ 2 ] || ( await askArgument( 'Type the platform' ) );
	if ( ! platform ) {
		notEnoughArgs = true;
	}

	const version =
		process.argv[ 3 ] || ( await askArgument( 'Type the version' ) );
	if ( ! version ) {
		notEnoughArgs = true;
	}

	const stacktraceFile = process.argv[ 4 ];
	let stacktrace;
	if ( ! stacktraceFile ) {
		stacktrace = (
			await askArgument( 'Type the stack trace', { multiline: true } )
		 ).split( '\n' );
	} else {
		console.log( `Reading stack trace from '${ stacktraceFile }'` );
		stacktrace = ( await fs.promises.readFile( stacktraceFile, 'utf8' ) )
			.toString()
			.split( '\n' );
	}
	if ( ! stacktrace ) {
		notEnoughArgs = true;
	}

	if ( notEnoughArgs ) {
		process.exit( 1 );
		return Promise.reject();
	}
	return { platform, version, stacktrace };
};

const getOriginalPosition = ( entry, { bytecodeContext, jsContext } ) => {
	if ( bytecodeContext ) {
		const bytecodePosition = getPositionFromContext(
			entry,
			bytecodeContext
		);
		return getPositionFromContext( bytecodePosition, jsContext );
	} else {
		return getPositionFromContext( entry, jsContext );
	}
};

getArguments().then( async ( { platform, version, stacktrace } ) => {
	try {
		const symbolicationContexts = await getSymbolicationContexts(
			platform,
			version
		);

		// Symbolicate stack trace entries
		console.log( 'Symbolicated stack trace:\n' );
		for ( const stacktraceEntry of stacktrace ) {
			if ( ! stacktraceEntry ) {
				continue;
			}

			const entry = parseEntry( stacktraceEntry );
			if ( ! entry ) {
				continue;
			}

			const { line, source, name } = getOriginalPosition(
				entry,
				symbolicationContexts
			);
			console.log( `\x1b[92m${ name }\x1b[0m - ${ source }:${ line }` );
		}
	} catch ( exception ) {
		console.error( `\x1b[31m${ exception }\x1b[0m` );
		return;
	}
} );
