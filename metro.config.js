const path = require( 'path' );
const fs = require( 'fs' );

const gutenbergMetroConfigCopy = {
	...require( './gutenberg/packages/react-native-editor/metro.config.js' ),
};

gutenbergMetroConfigCopy.resolver.extraNodeModules = new Proxy(
	{},
	{
		get: ( target, name ) => {
			const gutenbergFolder = path.join(
				process.cwd(),
				`gutenberg/node_modules/${ name }`
			);
			if ( fs.existsSync( gutenbergFolder ) ) {
				return gutenbergFolder;
			}

			// let's try find the mobile in the Jetpack submodule. We'll try the .pnpm folder.
			const moduleFolderPnpm = path.join(
				process.cwd(),
				`./jetpack/node_modules/.pnpm/node_modules/${ name }`
			);

			// pnpm uses symlinks so, let's find the target
			const symlinkTarget = fs.readlinkSync( moduleFolderPnpm );

			// the target is still using paths relative to the parent folder of the module, let's find the real path.
			return path.resolve( moduleFolderPnpm + '/../' + symlinkTarget );
		},
	}
);

module.exports = gutenbergMetroConfigCopy;
