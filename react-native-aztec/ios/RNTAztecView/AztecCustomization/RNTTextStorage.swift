import Aztec

/// RNTTextStorage contains customizations for Gutenberg editor
class RNTTextStorage: TextStorage {
    
    var blockType: BlockType = .other
    
    private var rntHtmlConverter = RNTHTMLConverter()
    
    /// Return RNTHTMLConverter for heading block only, other blocks keep using from super
    override var htmlConverter: HTMLConverter {
        switch blockType {
        case .heading:
            return rntHtmlConverter
        default:
            return super.htmlConverter
        }
    }
}
