import Aztec

/// AttributeFormatter to use for Gutenberg Heading blocks. Since
/// Heding blocks are bold by default we are giving them a tiny bit
/// of shadow to make them bolder.
class RNTHeaderBoldFormatter: StandardAttributeFormatter {
    
    private enum Shadow {
        
        static let blurRadiusNoBlur: CGFloat = 0.0
        
        enum Offset {
            static let width: CGFloat = 0.6
            static let height: CGFloat = 0.1
        }
    }
    
    private static var shadow: NSShadow = {
        let shadow = NSShadow()
        shadow.shadowBlurRadius = Shadow.blurRadiusNoBlur
        shadow.shadowOffset = CGSize(width: Shadow.Offset.width, height: Shadow.Offset.height)
        shadow.shadowColor = UIColor.black
        return shadow
    }()
    
    init() {
        super.init(attributeKey: .shadow, attributeValue: RNTHeaderBoldFormatter.shadow, htmlRepresentationKey: .boldHtmlRepresentation)
    }
}
