import Aztec

/// HeaderFormatter for Gutenberg header blocks which applies different font sizes and bold style
class RNTHeaderFormatter: HeaderFormatter {
    
    static let gutenbergFontSizeMap: [Header.HeaderType: Float] = {
        return [
            .h1: 24,
            .h2: 22,
            .h3: 20,
            .h4: 18,
            .h5: 16,
            .h6: 14,
            .none: 14
        ]
    }()
    
    override init(headerLevel: Header.HeaderType, fontSizeMap: [Header.HeaderType : Float]? = nil) {
        super.init(headerLevel: headerLevel, fontSizeMap:RNTHeaderFormatter.gutenbergFontSizeMap)
    }
    
    override func apply(to attributes: [NSAttributedStringKey: Any], andStore representation: HTMLRepresentation?) -> [NSAttributedStringKey: Any] {
        var resultingAttributes = super.apply(to: attributes, andStore: representation)
        guard let font = resultingAttributes[.font] as? UIFont else {
            return resultingAttributes
        }

        let newFont = font.modifyTraits(.traitBold, enable: true)
        resultingAttributes[.font] = newFont

        return resultingAttributes
    }
}
