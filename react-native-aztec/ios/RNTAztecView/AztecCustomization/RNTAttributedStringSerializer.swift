import Aztec

class RNTAttributedStringSerializer: AttributedStringSerializer {
    
    lazy var rntGenericElementConverter = RNTGenericElementConverter()
    
    override var genericElementConverter: GenericElementConverter {
        return rntGenericElementConverter
    }
}
