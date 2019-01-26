import Aztec

class RNTHTMLConverter: HTMLConverter {
    
    // MARK: - Converters: HTML -> AttributedString
    
    private(set) lazy var rntTreeToAttributedString: AttributedStringSerializer = {
        return RNTAttributedStringSerializer(customizer: pluginManager)
    }()
    
    override var treeToAttributedString: AttributedStringSerializer {
        return rntTreeToAttributedString
    }
    
    // MARK: - Converters: AttributedString -> HTML
    
    private(set) lazy var rntAttributedStringToTree: AttributedStringParser = {
        return RNTAttributedStringParser(customizer: pluginManager)
    }()
    
    override var attributedStringToTree: AttributedStringParser {
        return rntAttributedStringToTree
    }
}
