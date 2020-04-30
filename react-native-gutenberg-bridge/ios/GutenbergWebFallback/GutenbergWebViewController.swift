import UIKit
import WebKit

public protocol GutenbergWebDelegate: class {
    func webController(controller: GutenbergWebViewController, didPressSave block: Block)
    func webControllerDidPressClose(controller: GutenbergWebViewController)
    func webController(controller: GutenbergWebViewController, didLog log: String)
}

open class GutenbergWebViewController: UIViewController {
    enum GutenbergWebError: Error {
        case wrongEditorUrl(String?)
    }

    public weak var delegate: GutenbergWebDelegate?

    var isWPOrg: Bool {
        return true
    }

    private let block: Block
    private let jsInjection: FallbackJavascriptInjection

    private lazy var webView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.userContentController = jsInjection.userContent(messageHandler: self, blockHTML: block.content)
        configuration.suppressesIncrementalRendering = true
        return WKWebView(frame: .zero, configuration: configuration)
    }()

    public init(block: Block, userId: String) throws {
        self.block = block
        jsInjection = try FallbackJavascriptInjection(blockHTML: block.content, userId: userId)

        super.init(nibName: nil, bundle: nil)
    }

    required public init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func loadView() {
        view = webView
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        webView.navigationDelegate = self
        if #available(iOS 13.0, *) {
            isModalInPresentation = true
        }
        addNavigationBarElements()
        loadWebView()
    }

    open func getRequest(for webView: WKWebView, completion: (URLRequest) -> Void) {
        let request = URLRequest(url: URL(string: "https://wordpress.org/gutenberg/")!)
        completion(request)
    }

    public func cleanUp() {
         webView.configuration.userContentController.removeAllUserScripts()
         FallbackJavascriptInjection.JSMessage.allCases.forEach {
             webView.configuration.userContentController.removeScriptMessageHandler(forName: $0.rawValue)
         }
     }

    private func loadWebView() {
        getRequest(for: webView) { [weak self] (request) in
            self?.webView.load(request)
        }
    }

    @objc func onSaveButtonPressed() {
        evaluateJavascript(jsInjection.getHtmlContentScript)
    }

    @objc func onCloseButtonPressed() {
        delegate?.webControllerDidPressClose(controller: self)
    }

    private func addNavigationBarElements() {
        let saveButton = UIBarButtonItem(barButtonSystemItem: .save, target: self, action: #selector(onSaveButtonPressed))
        let cancelButton = UIBarButtonItem(barButtonSystemItem: .cancel, target: self, action: #selector(onCloseButtonPressed))

        navigationItem.rightBarButtonItem = saveButton
        navigationItem.leftBarButtonItem = cancelButton
        let localizedTitle = NSLocalizedString("Edit %@ block", comment: "Title of Gutenberg WEB editor running on a Web View. %@ is the localized block name.")
        title = String(format: localizedTitle, block.name)
    }

    private func evaluateJavascript(_ script: WKUserScript) {
        webView.evaluateJavaScript(script.source) { (response, error) in
            if let response = response {
                print("\(response)")
            }
            if let error = error {
                print("\(error)")
            }
        }
    }

    private func save(_ newContent: String) {
        delegate?.webController(controller: self, didPressSave: block.replacingContent(with: newContent))
    }
}

extension GutenbergWebViewController: WKNavigationDelegate {
    public func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if !isWPOrg && navigationResponse.response.url?.absoluteString.contains("/wp-admin/post-new.php") ?? false {
            evaluateJavascript(jsInjection.insertBlockScript)
        }
        decisionHandler(.allow)
    }

    public func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        // At this point, user scripts are not loaded yet, so we need to inject the
        // script that inject css manually before actually injecting the css.
        evaluateJavascript(jsInjection.injectCssScript)
        evaluateJavascript(jsInjection.injectEditorCssScript)
        evaluateJavascript(jsInjection.injectWPBarsCssScript)
        evaluateJavascript(jsInjection.injectLocalStorageScript)

    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Sometimes the editor takes longer loading and its CSS can override what
        // Injectic Editor specific CSS when everything is loaded to avoid overwritting parameters if gutenberg CSS load later.
        evaluateJavascript(jsInjection.injectEditorCssScript)
        if isWPOrg {
            evaluateJavascript(jsInjection.insertBlockScript)
        }
    }
}

extension GutenbergWebViewController: WKScriptMessageHandler {
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard
            let messageType = FallbackJavascriptInjection.JSMessage(rawValue: message.name),
            let body = message.body as? String
        else {
            return
        }

        handle(messageType, body: body)
    }

    private func handle(_ message: FallbackJavascriptInjection.JSMessage, body: String) {
        switch message {
        case .log:
            delegate?.webController(controller: self, didLog: body)
        case .htmlPostContent:
            save(body)
        }
    }
}
