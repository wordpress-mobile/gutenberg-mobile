import Aztec

class RNTTextStorage: TextStorage {
    
    var blockType: BlockType = .other
    
    private var rntHtmlConverter = RNTHTMLConverter()
    
    override var htmlConverter: HTMLConverter {
        switch blockType {
        case .heading:
            return rntHtmlConverter
        default:
            return super.htmlConverter
        }
    }
}
