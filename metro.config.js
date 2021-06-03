const path = require( 'path' );
const fs = require( 'fs' );

const gutenbergMetroConfigCopy = {
	...require( './gutenberg/packages/react-native-editor/metro.config.js' ),
};

gutenbergMetroConfigCopy.resolver.extraNodeModules = new Proxy(
	{},
	{
		get: ( target, name ) => {
			const gutenberg_folder = path.join(
				process.cwd(),
				`gutenberg/node_modules/${ name }`
			);
			if ( fs.existsSync( gutenberg_folder ) ) {
				return gutenberg_folder;
			}

			// let's try find the mobile in the Jetpack submodule. We'll try the .pnpm folder.
			const pnpm_module_dir = path.join(
				process.cwd(),
				`./jetpack/node_modules/.pnpm/node_modules/${ name }`
			);

			// pnpm uses symlinks so, let's find the target
			const symlink_target = fs.readlinkSync( pnpm_module_dir );

			// the target is still using paths relative to the parent folder of the module, let's find the real path.
			const real_path = path.resolve(
				pnpm_module_dir + '/../' + symlink_target
			);
			return real_path;
		},
	}
);

module.exports = gutenbergMetroConfigCopy;
