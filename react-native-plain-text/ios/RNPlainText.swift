import UIKit

protocol RNPlainTextDelegate: class {
    var shouldInterceptEnter: Bool { get }
    func onEnterPress()
}

class RNPlainText: RCTUITextView {
    weak var plainTextDelegate: RNPlainTextDelegate?

    private func interceptEnter(_ text: String) -> Bool {
        guard
            let delegate = plainTextDelegate,
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
