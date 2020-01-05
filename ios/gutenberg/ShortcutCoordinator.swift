import UIKit
import RNReactNativeGutenbergBridge

class ShortcutCoordinator: UIResponder {
  let gutenberg: Gutenberg
  var responder: UIResponder?
  init(gutenberg: Gutenberg) {
    self.gutenberg = gutenberg
  }
  
  @objc func toggleBold() {    
    gutenberg.sendShortcut(.bold)
  }
  
  @objc func toggleItalic() {
    gutenberg.sendShortcut(.italic)
  }
  
  @objc func addEditLink() {
    gutenberg.sendShortcut(.addEditLink)
  }
  
  override var next: UIResponder? {
    return responder
  }
  
  override var keyCommands: [UIKeyCommand]? {
    return [
      UIKeyCommand(input:"B",
                 modifierFlags: .command,
                 action:#selector(toggleBold),
                 discoverabilityTitle:NSLocalizedString("Bold", comment: "Discoverability title for bold formatting keyboard shortcut.")
      ),
      UIKeyCommand(input:"I",
                   modifierFlags: .command,
                   action:#selector(toggleItalic),
                   discoverabilityTitle:NSLocalizedString("Italic", comment: "Discoverability title for italic formatting keyboard shortcut.")
      ),
      UIKeyCommand(input: "K",
                   modifierFlags: .command,
                   action:#selector(addEditLink),
                   discoverabilityTitle:NSLocalizedString("Add/Edit Link", comment: "Discoverability title for add/edit link keyboard shortcut")
      )
    ]
  }
}

