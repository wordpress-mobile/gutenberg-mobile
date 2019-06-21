import Foundation

@objc (WPTextInputManager)
public class WPTextInputManager: RCTBaseTextInputViewManager {
    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public override func view() -> UIView {
        return WPBackedTextInputView(bridge: self.bridge)
    }
}
