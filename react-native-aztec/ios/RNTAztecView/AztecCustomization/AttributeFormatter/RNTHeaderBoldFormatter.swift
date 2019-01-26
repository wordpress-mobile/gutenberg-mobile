import Aztec

class RNTHeaderBoldFormatter: StandardAttributeFormatter {
    init() {
        let myShadow = NSShadow()
        myShadow.shadowBlurRadius = 0.5
        myShadow.shadowOffset = CGSize(width: 0.5, height: 0.5)
        myShadow.shadowColor = UIColor.black
        
        super.init(attributeKey: .shadow, attributeValue: myShadow, htmlRepresentationKey: .boldHtmlRepresentation)
    }

}
