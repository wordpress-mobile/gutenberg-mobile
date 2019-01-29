import Aztec

/// AttributeFormatter to use for Gutenberg Heading blocks. Since
/// Heding blocks are bold by default we are giving them a tiny bit
/// of shadow and letter spacing to make them bolder.
class RNTHeaderBoldFormatter: AttributeFormatter {
    
    private enum Shadow {
        static let blurRadiusNoBlur: CGFloat = 0.0
        enum Offset {
            static let width: CGFloat = 0.7
            static let height: CGFloat = 0.1
        }
        static let shadowOffsetFontSizeRatio: CGFloat = Offset.width/CGFloat(RNTHeaderFormatter.gutenbergFontSizeMap[.h3] ?? h3DefaultFontSize)
    }
    
    static let letterSpacing: CGFloat = 0.6
    static let h3DefaultFontSize: Float = 22
    
    private let shadowOffsetFontSizeRatio = Shadow.Offset.width/CGFloat(RNTHeaderFormatter.gutenbergFontSizeMap[.h3] ?? h3DefaultFontSize)
    private let letterSpacingFontSizeRatio = letterSpacing/CGFloat(RNTHeaderFormatter.gutenbergFontSizeMap[.h3] ?? h3DefaultFontSize)
    private let htmlRepresentationKey: NSAttributedStringKey = .boldHtmlRepresentation

    private static func shadow(width: CGFloat = Shadow.Offset.width, height: CGFloat = Shadow.Offset.height) -> NSShadow {
        let shadow = NSShadow()
        shadow.shadowBlurRadius = Shadow.blurRadiusNoBlur
        shadow.shadowOffset = CGSize(width: width, height: height)
        shadow.shadowColor = UIColor.black
        return shadow
    }
    
    func apply(to attributes: [NSAttributedStringKey: Any], andStore representation: HTMLRepresentation?) -> [NSAttributedStringKey: Any] {
        var resultingAttributes = attributes
        guard let font = resultingAttributes[.font] as? UIFont else {
            resultingAttributes[.shadow] = RNTHeaderBoldFormatter.shadow()
            resultingAttributes[.kern] =  RNTHeaderBoldFormatter.letterSpacing
            return resultingAttributes
        }
        //Calculate shadow density and letter spacing with respect to the font size
        resultingAttributes[.shadow] = RNTHeaderBoldFormatter.shadow(width: shadowOffsetFontSizeRatio*font.pointSize)
        resultingAttributes[.kern] = letterSpacingFontSizeRatio*font.pointSize
        resultingAttributes[.boldHtmlRepresentation] = representation
        
        return resultingAttributes
    }
    
    func remove(from attributes: [NSAttributedStringKey: Any]) -> [NSAttributedStringKey: Any] {
        var resultingAttributes = attributes
        
        resultingAttributes.removeValue(forKey: .shadow)
        resultingAttributes.removeValue(forKey: .kern)

        resultingAttributes.removeValue(forKey: .boldHtmlRepresentation)
        
        return resultingAttributes
    }

    func present(in attributes: [NSAttributedStringKey: Any]) -> Bool {
        return attributes[.shadow] != nil
    }
    
    func applicationRange(for range: NSRange, in text: NSAttributedString) -> NSRange {
        return range
    }
}
