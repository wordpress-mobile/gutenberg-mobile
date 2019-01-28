import Aztec


class RNTGenericElementConverter: GenericElementConverter {
    
    lazy var boldFormatter = RNTHeaderBoldFormatter()
    lazy var h1Formatter = RNTHeaderFormatter(headerLevel: .h1)
    lazy var h2Formatter = RNTHeaderFormatter(headerLevel: .h2)
    lazy var h3Formatter = RNTHeaderFormatter(headerLevel: .h3)
    lazy var h4Formatter = RNTHeaderFormatter(headerLevel: .h4)
    lazy var h5Formatter = RNTHeaderFormatter(headerLevel: .h5)
    lazy var h6Formatter = RNTHeaderFormatter(headerLevel: .h6)
    
    override var elementFormattersMap: [Element: AttributeFormatter] {
        var map = super.elementFormattersMap
        map[.strong] = boldFormatter
        map[.h1] = self.h1Formatter
        map[.h2] = self.h2Formatter
        map[.h3] = self.h3Formatter
        map[.h4] = self.h4Formatter
        map[.h5] = self.h5Formatter
        map[.h6] = self.h6Formatter
        return map
    }
}
