import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AppViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// Faixa grafite fixa atrás da barra de status (hora/bateria): sem ela, o site aparece por baixo
// da hora ao rolar a página. A tela do Capacitor é o próprio WKWebView, então a faixa fica por cima dele.
class AppViewController: CAPBridgeViewController {
    private let faixaTopo = UIView()

    override func viewDidLoad() {
        super.viewDidLoad()
        faixaTopo.backgroundColor = UIColor(red: 0x1A / 255.0, green: 0x1A / 255.0, blue: 0x1A / 255.0, alpha: 1)
        faixaTopo.isUserInteractionEnabled = false
        view.addSubview(faixaTopo)
        setStatusBarStyle(.lightContent)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        faixaTopo.frame = CGRect(x: 0, y: 0, width: view.bounds.width, height: view.safeAreaInsets.top)
        view.bringSubviewToFront(faixaTopo)
    }
}
