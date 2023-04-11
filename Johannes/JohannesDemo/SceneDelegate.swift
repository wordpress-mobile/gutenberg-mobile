import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        window = UIWindow(frame: windowScene.coordinateSpace.bounds)
        window?.windowScene = windowScene

        // Some code in the dependencies access the application delegate window under the hood, so we
        // need it available. We'll be setting it in SceneDelegate, where we read the window from the
        // scene that's passed at runtime.
        (UIApplication.shared.delegate as? AppDelegate)?.window = window

        let rootViewController = ViewController()

        window?.rootViewController = UINavigationController(rootViewController: rootViewController)
        window?.makeKeyAndVisible()
    }
}
