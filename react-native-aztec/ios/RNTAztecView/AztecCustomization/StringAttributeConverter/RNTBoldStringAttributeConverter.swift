import Aztec

class RNTBoldStringAttributeConverter: BoldStringAttributeConverter {
    
    override func shouldEnableBold(for attributes: [NSAttributedStringKey : Any]) -> Bool {
        return attributes[.shadow] != nil
    }
}
