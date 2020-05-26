package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'Gutenberg'
  s.version          = package['version']
  s.summary          = 'Printing since 1440'
  s.homepage     = 'https://github.com/wordpress-mobile/gutenberg-mobile'
  s.license      = package['license']
  s.authors          = 'Automattic'
  s.platform     = :ios, '11.0'
  s.source       = { :git => 'https://github.com/wordpress-mobile/gutenberg-mobile.git' }
  s.source_files = 'gutenberg/packages/react-native-bridge/ios/*.{h,m,swift}'
  s.requires_arc = true
  s.preserve_paths = 'bundle/ios/*'
  s.swift_version = '5.0'

end
