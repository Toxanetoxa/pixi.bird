import { Application } from "pixi.js";
import Scene from "./Scene";
import { Debug } from "../utils/debug";
import AssetLoader from "./AssetLoader";

// Если приложение работает в режиме DEV, инициализируем отладчик
if (import.meta.env.DEV) Debug.init();

// Интерфейс для утилит сцены
export interface SceneUtils {
	assetLoader: AssetLoader;
}

export default class SceneManager {
	// Конструкторы сцен, полученных из модулей, импортированных по Glob-пути
	private sceneConstructors = this.importScenes();

	// Экземпляр приложения PIXI.js
	app: Application;

	// Map, содержащая экземпляры сцен, индексированные по их именам
	sceneInstances = new Map<string, Scene>();

	// Текущая активная сцена
	currentScene?: Scene;

	constructor() {
		// Создаем экземпляр приложения PIXI.js, передавая настройки
		this.app = new Application({
			view: document.querySelector("#app") as HTMLCanvasElement,
			autoDensity: true,
			resizeTo: window,
			powerPreference: "high-performance",
			backgroundColor: 0x23272a,
		});

		// Добавляем обработчик события resize, вызывающий метод onResize у текущей сцены
		window.addEventListener("resize", (ev: UIEvent) => {
			const target = ev.target as Window;

			this.currentScene?.onResize?.(target.innerWidth, target.innerHeight);
		});
	}

	// Импортируем конструкторы сцен из модулей, импортированных по Glob-пути
	importScenes() {
		const sceneModules = import.meta.glob("/src/scenes/*.ts", {
			eager: true,
		}) as Record<string, { default: ConstructorType<typeof Scene> }>;

		return Object.entries(sceneModules).reduce((acc, [path, module]) => {
			const fileName = path.split("/").pop()?.split(".")[0];

			if (!fileName) throw new Error("Error while parsing filename");

			acc[fileName] = module.default;

			return acc;
		}, {} as Record<string, ConstructorType<typeof Scene>>);
	}

	// Метод для переключения на новую сцену
	async switchScene(sceneName: string, deletePrevious = true): Promise<Scene> {
		await this.removeScene(deletePrevious);

		this.currentScene = this.sceneInstances.get(sceneName);

		// Если сцены еще нет в списке экземпляров, создаем новый экземпляр
		if (!this.currentScene) this.currentScene = await this.initScene(sceneName);

		if (!this.currentScene)
			throw new Error(`Failed to initialize scene: ${sceneName}`);

		// Добавляем текущую сцену на сцену приложения PIXI.js
		this.app.stage.addChild(this.currentScene);

		if (this.currentScene.start) await this.currentScene.start();

		return this.currentScene;
	}

	// Удаляем текущую сцену из списка экземпляров
	private async removeScene(destroyScene: boolean) {
		if (!this.currentScene) return;

		if (destroyScene) {
			this.sceneInstances.delete(this.currentScene.name);

			// Уничтожаем экземпляр сцены и все его дочерние элементы
			this.currentScene.destroy({ children: true });
		} else {
			// Удаляем текущую сцену со сцены приложения PIXI.js
			this.app.stage.removeChild(this.currentScene);
		}

		if (this.currentScene.unload) await this.currentScene.unload();

		this.currentScene = undefined;
	}

	// Создаем новый экземпляр сцены и добавляем его в список экземпляров
	private async initScene(sceneName: string) {
		const sceneUtils = {
			assetLoader: new AssetLoader(),
		};

		const scene = new this.sceneConstructors[sceneName](sceneUtils);

		this.sceneInstances.set(sceneName, scene);

		if (scene.load) await scene.load();

		return scene;
	}
}
