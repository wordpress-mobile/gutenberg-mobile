import Aztec

class RNTAttributedStringParser: AttributedStringParser {
    
    private let rntStringAttributeConverters: [StringAttributeConverter] = [
        RNTBoldStringAttributeConverter(),
        ConditionalItalicStringAttributeConverter(),
        UnderlineStringAttributeConverter(),
    ]
    
    override var stringAttributeConverters: [StringAttributeConverter] {
        return rntStringAttributeConverters
    }
}
