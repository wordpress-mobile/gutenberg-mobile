const path = require( 'path' );

let gutenbergMetroConfigCopy = { ...require( './gutenberg/packages/react-native-editor/metro.config.js' ) };

gutenbergMetroConfigCopy.resolver.extraNodeModules = new Proxy({}, {
	get: (target, name) => path.join(process.cwd(), `gutenberg/node_modules/${name}`),
})

module.exports = gutenbergMetroConfigCopy;