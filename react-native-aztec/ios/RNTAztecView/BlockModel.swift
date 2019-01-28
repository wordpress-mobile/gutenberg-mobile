struct BlockModel {
    let tag: String
    let type: BlockType
    
    init(tag: String) {
        self.tag = tag
        if HeadingBlockFormatHandler(tag: tag) != nil {
            type = .heading
        } else {
            type = .other
        }
    }

}

enum BlockType {
    case heading
    case other
}
