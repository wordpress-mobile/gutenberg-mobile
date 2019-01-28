import Aztec

struct HeadingBlockFormatHandler: BlockFormatHandler {

    private let paragraphFormatter = HTMLParagraphFormatter(placeholderAttributes: nil)
    private let headerFormatter: HeaderFormatter

    init?(tag: String) {
        guard let level = HeadingBlockFormatHandler.headerLevel(from: tag) else {
            return nil
        }
        headerFormatter = RNTHeaderFormatter(headerLevel: level)
    }
    
    func forceTypingFormat(on textView: RCTAztecView) {
        var attributes = textView.typingAttributesSwifted

        attributes = paragraphFormatter.remove(from: attributes)
        attributes = headerFormatter.apply(to: attributes, andStore: nil)

        textView.typingAttributesSwifted = attributes
    }

    static func headerLevel(from levelString: String) -> Header.HeaderType? {
        switch levelString {
        case "h2":
            return .h2
        case "h3":
            return .h3
        case "h4":
            return .h4
        default:
            return nil
        }
    }
}
