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
  s.platform     = :ios, '11.0'
  s.source       = { :git => 'https://github.com/wordpress-mobile/gutenberg-mobile.git', :submodules => true }
  s.source_files = 'gutenberg/packages/react-native-bridge/ios/**/*.{h,m,swift}'
  s.requires_arc = true
  s.preserve_paths = 'bundle/ios/*'
  s.swift_version = '5.0'
  s.resources = 'gutenberg/packages/react-native-bridge/common/**/*.{js,css,json}'

  s.dependency 'React', react_native_version
  s.dependency 'React-CoreModules', react_native_version
  s.dependency 'React-RCTImage', react_native_version

  rntAztecViewSpec = Pod::Spec.from_file(File.join(__dir__, 'gutenberg', 'packages', 'react-native-aztec', 'RNTAztecView.podspec'))
  
  s.subspec 'RNTAztecView' do |rntaztecview|
    rntaztecview.name = rntAztecViewSpec.attributes_hash['name']
    # rntaztecview.version = rntAztecViewSpec.attributes_hash['version']
    # rntaztecview.summary = rntAztecViewSpec.attributes_hash['summary']
    # rntaztecview.license = rntAztecViewSpec.attributes_hash['license']
    # rntaztecview.homepage = rntAztecViewSpec.attributes_hash['homepage']
    # rntaztecview.authors = rntAztecViewSpec.attributes_hash['authors']
    # rntaztecview.source = rntAztecViewSpec.attributes_hash['source']
    rntaztecview.source_files = 'gutenberg/packages/react-native-aztec/' + rntAztecViewSpec.attributes_hash['source_files']
    rntaztecview.public_header_files = 'gutenberg/packages/react-native-aztec/' + rntAztecViewSpec.attributes_hash['public_header_files']
    rntaztecview.requires_arc = rntAztecViewSpec.attributes_hash['requires_arc']
    rntaztecview.platforms = rntAztecViewSpec.attributes_hash['platforms']
    rntaztecview.swift_version = rntAztecViewSpec.attributes_hash['swift_version']
    rntaztecview.xcconfig = rntAztecViewSpec.attributes_hash['xcconfig']
    
    rntaztecview.dependencies = rntAztecViewSpec.attributes_hash['dependencies']
  end

  s.default_subspec = 'RNTAztecView'
end
