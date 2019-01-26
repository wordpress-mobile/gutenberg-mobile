import Aztec


class RNTGenericElementConverter: GenericElementConverter {
    
    lazy var boldFormatter = RNTHeaderBoldFormatter()
    lazy var h1Formatter = RNTHeaderFormatter(headerLevel: .h1)
    lazy var h2Formatter = RNTHeaderFormatter(headerLevel: .h2)
    lazy var h3Formatter = RNTHeaderFormatter(headerLevel: .h3)
    lazy var h4Formatter = RNTHeaderFormatter(headerLevel: .h4)
    lazy var h5Formatter = RNTHeaderFormatter(headerLevel: .h5)
    lazy var h6Formatter = RNTHeaderFormatter(headerLevel: .h6)
    
    open override func getElementFormattersMap() -> [Element: AttributeFormatter] {
        var elementFormattersMap = super.getElementFormattersMap()
        elementFormattersMap[.strong] = boldFormatter
        elementFormattersMap[.h1] = self.h1Formatter
        elementFormattersMap[.h2] = self.h2Formatter
        elementFormattersMap[.h3] = self.h3Formatter
        elementFormattersMap[.h4] = self.h4Formatter
        elementFormattersMap[.h5] = self.h5Formatter
        elementFormattersMap[.h6] = self.h6Formatter
        return elementFormattersMap
    }
}
