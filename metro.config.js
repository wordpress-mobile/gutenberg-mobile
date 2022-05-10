const path = require( 'path' );
const fs = require( 'fs' );
const metroResolver = require( 'metro-resolver' );

const gutenbergMetroConfig = require( './gutenberg/packages/react-native-editor/metro.config.js' );
const extraNodeModules = {};
const gutenbergMetroConfigCopy = {
  ...gutenbergMetroConfig,
  resolver: {
    ...gutenbergMetroConfig.resolver,
    sourceExts: [ 'js', 'jsx', 'json', 'scss', 'sass', 'ts', 'tsx' ],
    extraNodeModules,
  },
};

const nodeModulePaths = [
  'gutenberg/node_modules',
  'jetpack/projects/plugins/jetpack/node_modules/',
].map( ( dir ) => path.join( process.cwd(), dir ) );

function modulePathExists( name ) {
  return ( path ) => fs.existsSync( `${ path }/${ name }` );
}

gutenbergMetroConfigCopy.resolver.resolveRequest = (
  context,
  moduleName,
  platform
) => {
  if ( moduleName[ 0 ] !== '.' ) {
    const [ namespace, module = '' ] = moduleName.split( '/' );
    const name = `${ namespace }/${ module }`.replace( /\/$/, '' );

    if ( ! extraNodeModules[ name ] ) {
      const modulePath = nodeModulePaths.find( modulePathExists( name ) );

      if ( modulePath ) {
        extraNodeModules[ name ] = fs.realpathSync(
          `${ modulePath }/${ name }`
        );
      }
  }

  return metroResolver.resolve(
    {
      ...context,
      resolveRequest: null,
    },
    moduleName,
    platform
  );
};
module.exports = gutenbergMetroConfigCopy;
