require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

version_xcconfig_path = File.join(File.expand_path(__dir__),  'ios-xcframework','Config', 'Gutenberg-Shared.xcconfig')
app_ios_deployment_target = Gem::Version.new(Xcodeproj::Config.new(version_xcconfig_path).to_hash['IPHONEOS_DEPLOYMENT_TARGET']).to_s

Pod::Spec.new do |s|
  s.name             = 'RNTAztecView'
  s.version          = package['version']
  s.summary          = 'Aztec editor for React Native'
  s.license          = package['license']
  s.homepage         = 'https://github.com/wordpress-mobile/gutenberg-mobile'
  s.authors          = 'Automattic'
  s.source           = { :git => 'https://github.com/wordpress-mobile/gutenberg-mobile.git', :submodules => true }
  s.source_files     = 'gutenberg/packages/react-native-aztec/ios/RNTAztecView/*.{h,m,swift}'
  s.public_header_files = 'gutenberg/packages/react-native-aztec/ios/RNTAztecView/*.h'
  s.requires_arc     = true
  s.platforms        = { :ios => app_ios_deployment_target }
  s.swift_version    = '5.0'
  s.xcconfig         = {'OTHER_LDFLAGS' => '-lxml2',
                        'HEADER_SEARCH_PATHS' => '/usr/include/libxml2'}
  s.dependency         'React-Core'
  s.dependency         'WordPress-Aztec-iOS', '~> 1.19.8'

end
