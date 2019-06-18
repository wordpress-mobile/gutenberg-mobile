import Foundation

@objc (RNPlainTextManager)
public class RNPlainTextManager: RCTBaseTextInputViewManager {
    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public override func view() -> UIView {
        return RNBackedPlainTextView(bridge: self.bridge)
    }
}
