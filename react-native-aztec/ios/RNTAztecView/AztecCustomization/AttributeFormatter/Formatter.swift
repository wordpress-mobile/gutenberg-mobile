import Aztec

enum Formatters {
    static let bold = RNTHeaderBoldFormatter()
    static let h1 = RNTHeaderFormatter(headerLevel: .h1)
    static let h2 = RNTHeaderFormatter(headerLevel: .h2)
    static let h3 = RNTHeaderFormatter(headerLevel: .h3)
    static let h4 = RNTHeaderFormatter(headerLevel: .h4)
    static let h5 = RNTHeaderFormatter(headerLevel: .h5)
    static let h6 = RNTHeaderFormatter(headerLevel: .h6)
}
