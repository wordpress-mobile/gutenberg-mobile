import UIKit

protocol WPTextInputDelegate: class {
    var shouldInterceptEnter: Bool { get }
    func onEnterPress()
}

class WPTextInput: RCTUITextView {
    weak var wpTextInputDelegate: WPTextInputDelegate?

    private func interceptEnter(_ text: String) -> Bool {
        guard
            let delegate = wpTextInputDelegate,
            delegate.shouldInterceptEnter,
            text == "\n"
        else {
            return false
        }

        delegate.onEnterPress()
        return true
    }

    override func insertText(_ text: String) {
        guard !interceptEnter(text) else {
            return
        }
        super.insertText(text)
    }
}
