import UIKit

class WPBackedTextInputView: RCTBaseTextInputView {
    lazy var _backedTextInputView: WPTextInput = {
        let textInput = WPTextInput(frame: self.bounds)
        textInput.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        textInput.backgroundColor = .clear
        textInput.textColor = .black
        textInput.textContainer.lineFragmentPadding = 0
        textInput.scrollsToTop = false
        textInput.isScrollEnabled = false
        textInput.textInputDelegate = self
        textInput.wpTextInputDelegate = self
        return textInput
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

extension WPBackedTextInputView: WPTextInputDelegate {
    var shouldInterceptEnter: Bool {
        return onEnter != nil
    }

    func onEnterPress() {
        onEnter?([:])
    }
}
