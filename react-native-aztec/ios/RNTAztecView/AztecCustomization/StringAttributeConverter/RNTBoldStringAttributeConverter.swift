import Aztec

/// Converts the shadow style information from string attributes and aggregates
/// it into an existing array of element nodes.
class RNTBoldStringAttributeConverter: BoldStringAttributeConverter {
    
    /// Enables "<strong>" element if given attributes contains value for NSAttributedString.Key.shadow
    override func shouldEnableBold(for attributes: [NSAttributedStringKey : Any]) -> Bool {
        return attributes[.shadow] != nil
    }
}
