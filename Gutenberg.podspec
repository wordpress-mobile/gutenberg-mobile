gutenbergPackage = JSON.parse(File.read(File.join(__dir__, 'gutenberg', 'package.json')))
gutenbergMobilePackage = JSON.parse(File.read(File.join(__dir__, 'package.json')))
# Use the same RN version that the JS tools use
react_native_version = gutenbergPackage['devDependencies']['react-native']
# Extract the tagged version if package.json points to a tag
react_native_version = react_native_version.split("#v").last if react_native_version.include? "#v"

Pod::Spec.new do |s|
  s.name             = 'Gutenberg'
  s.version          = gutenbergMobilePackage['version']
  s.summary          = 'Printing since 1440'
  s.homepage     = 'https://github.com/wordpress-mobile/gutenberg-mobile'
  s.license      = gutenbergMobilePackage['license']
  s.authors          = 'Automattic'
  s.platform     = :ios, '13.0'
  s.source       = { :git => 'https://github.com/wordpress-mobile/gutenberg-mobile.git', :submodules => true }
  s.source_files = 'gutenberg/packages/react-native-bridge/ios/**/*.{h,m,swift}'
  s.requires_arc = true
  s.preserve_paths = 'bundle/ios/*'
  s.swift_version = '5.0'
  s.resources = ['gutenberg/packages/react-native-bridge/common/**/*.{js,css,json}', 'src/block-support/supported-blocks.json', 'resources/**/*.js']

  s.dependency 'React', react_native_version
  s.dependency 'React-CoreModules', react_native_version
  s.dependency 'React-RCTImage', react_native_version

  s.dependency 'RNTAztecView'
end
