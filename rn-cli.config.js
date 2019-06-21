/** @format */
const path = require( 'path' );
const blacklist = require( 'metro-config/src/defaults/blacklist' );
// Blacklist the nested GB filetree so modules are not resolved in duplicates,
//  both in the nested directory and the parent directory.
const blacklistElements = blacklist( [
	new RegExp( path.basename( __dirname ) + '/gutenberg/node_modules/.*' ),
	new RegExp( path.basename( __dirname ) + '/gutenberg/gutenberg-mobile/.*' ),
	new RegExp( path.basename( __dirname ) + '/react-native-aztec-old-submodule/.*' ),
] );

function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}

const enm = require( './extra-node-modules.config.js' );

module.exports = {
	watchFolders:[ '/Users/pinarolguc/Development/mobile-gutenberg-plugin-starter-test/plugins/gutenberg-plugin-hello-world' ],
	extraNodeModules: extend (
    {
      '@wordpress-mobile/gutenberg-plugin-hello-world': '/Users/pinarolguc/Development/mobile-gutenberg-plugin-starter-test/plugins/gutenberg-plugin-hello-world'
  	},
    enm
  ),
	resolver: {
		blacklistRE: blacklistElements,
		sourceExts: [ 'js', 'json', 'scss', 'sass' ],
	},
	transformer: {
		babelTransformerPath: require.resolve( './sass-transformer.js' ),
	},
};
