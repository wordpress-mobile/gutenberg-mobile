import UIKit

class RNBackedPlainTextView: RCTBaseTextInputView {
    lazy var _backedTextInputView: RNPlainText = {
        let plainText = RNPlainText(frame: self.bounds)
        plainText.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        plainText.backgroundColor = .clear
        plainText.textColor = .black
        plainText.textContainer.lineFragmentPadding = 0
        plainText.scrollsToTop = false
        plainText.isScrollEnabled = false
        plainText.textInputDelegate = self
        plainText.plainTextDelegate = self
        return plainText
    }()

    override init(bridge: RCTBridge) {
        super.init(bridge: bridge)
        blurOnSubmit = false
        self.addSubview(_backedTextInputView)
    }

    override var backedTextInputView: UIView & RCTBackedTextInputViewProtocol {
        return _backedTextInputView
    }

    @objc var onEnter: RCTBubblingEventBlock? = nil
}

extension RNBackedPlainTextView: RNPlainTextDelegate {
    var shouldInterceptEnter: Bool {
        return onEnter != nil
    }

    func onEnterPress() {
        onEnter?([:])
    }
}
