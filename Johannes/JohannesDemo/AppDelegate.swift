import UIKit
import Johannes

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    // Some code in the dependencies access the application delegate window under the hood, so we
    // need it available. We'll be setting it in SceneDelegate, where we read the window from the
    // scene that's passed at runtime.
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        _ = try! FallbackJavascriptInjection(blockHTML: "Hello", userId: "1")
        print("Hello world!")

        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
}
