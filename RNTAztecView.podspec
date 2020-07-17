rntAztecViewSpec = Pod::Spec.from_file(File.join(__dir__, 'gutenberg', 'packages', 'react-native-aztec', 'RNTAztecView.podspec'))

Pod::Spec.new do |s|	
  s.name = rntAztecViewSpec.attributes_hash['name']
  s.version = rntAztecViewSpec.attributes_hash['version']
  s.summary = rntAztecViewSpec.attributes_hash['summary']
  s.license = rntAztecViewSpec.attributes_hash['license']
  s.homepage = rntAztecViewSpec.attributes_hash['homepage']
  s.authors = rntAztecViewSpec.attributes_hash['authors']
  s.source = rntAztecViewSpec.attributes_hash['source']
  s.source_files = 'gutenberg/packages/react-native-aztec/' + rntAztecViewSpec.attributes_hash['source_files']
  s.public_header_files = 'gutenberg/packages/react-native-aztec/' + rntAztecViewSpec.attributes_hash['public_header_files']
  s.requires_arc = rntAztecViewSpec.attributes_hash['requires_arc']
  s.platforms = rntAztecViewSpec.attributes_hash['platforms']
  s.swift_version = rntAztecViewSpec.attributes_hash['swift_version']
  s.xcconfig = rntAztecViewSpec.attributes_hash['xcconfig']

  s.dependencies = rntAztecViewSpec.attributes_hash['dependencies']
  
end
