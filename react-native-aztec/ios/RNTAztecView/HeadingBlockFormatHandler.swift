import Aztec

struct HeadingBlockFormatHandler: BlockFormatHandler {

    private let paragraphFormatter = HTMLParagraphFormatter(placeholderAttributes: nil)
    var level: Header.HeaderType
    
    static var gutenbergFontSizeMap: [Header.HeaderType: Float] = {
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

    init?(block: BlockModel) {
        guard let level = HeadingBlockFormatHandler.headerLevel(from: block.tag) else {
            return nil
        }
        self.level = level
    }

    var fontSize: CGFloat {
        return CGFloat(level.fontSize(for: HeadingBlockFormatHandler.gutenbergFontSizeMap))
    }

    func forceTypingFormat(on textView: RCTAztecView) {
        var attributes = textView.typingAttributesSwifted

        attributes = paragraphFormatter.remove(from: attributes)

        textView.typingAttributesSwifted = attributes
    }

    private static func headerLevel(from levelString: String) -> Header.HeaderType? {
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
