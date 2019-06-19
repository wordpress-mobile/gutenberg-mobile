/** @format */
const path = require( 'path' );
const blacklist = require( 'metro-config/src/defaults/blacklist' );
const getWorkspaces = require('get-yarn-workspaces');

const workspaces = getWorkspaces(__dirname);

function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}

// Blacklist the nested GB filetree so modules are not resolved in duplicates,
//  both in the nested directory and the parent directory.
const blacklistElements = [
	new RegExp( path.basename( __dirname ) + '/gutenberg/node_modules/.*' ),
	new RegExp( path.basename( __dirname ) + '/gutenberg/gutenberg-mobile/.*' ),
	new RegExp( path.basename( __dirname ) + '/react-native-aztec-old-submodule/.*' ),
];

const enm = require( './extra-node-modules.config.js' );

const root = path.resolve(__dirname, "../");

function getBlacklistRE() {
  return blacklist(
    workspaces.map(
      workspacePath =>
        `/${workspacePath.replace(
          /\//g,
          '[/\\\\]'
        )}[/\\\\]node_modules[/\\\\]react-native[/\\\\].*/`
    ).concat(blacklistElements)
  )
}

function getWatchFolders(nodeModules) {
  return [
    // Include your forked package as a new root.
    nodeModules || path.resolve(__dirname, '..', 'node_modules'),
  ].concat(workspaces)
}

const options = { 
	projectRoot: path.resolve(__dirname),
	watchFolders: getWatchFolders(path.resolve(__dirname, '..')),
	extraNodeModules: extend (
    {
  		'react-native': path.resolve(__dirname, 'node_modules/react-native'), 
      'gutenberg-plugin-hello-world': path.resolve(__dirname, '../plugins/gutenberg-plugin-hello-world')
  	},
    enm
  ),
	resolver: {
		sourceExts: [ 'js', 'json', 'scss', 'sass' ],
		blacklistRE: getBlacklistRE(),
	},
	transformer: {
		babelTransformerPath: require.resolve( './sass-transformer.js' ),
	},
 };

console.log(__dirname);

console.log(options);
module.exports = options;