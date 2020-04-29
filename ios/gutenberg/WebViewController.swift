import WebKit

class WebViewController: UIViewController {
    let webView = WKWebView()
    var onDismiss: (() -> Void)?

    init(htmlContent: String) {
        super.init(nibName: nil, bundle: nil)
        let meta = "<meta name=\"viewport\" content=\"width=device-width, shrink-to-fit=YES\">"
        let content = meta + htmlContent
        webView.loadHTMLString(content, baseURL: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
      
        view = webView
    }

    deinit {
        onDismiss?()
    }
}
