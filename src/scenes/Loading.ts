import { Sprite, Text } from "pixi.js";
import Scene from "../core/Scene";
import { centerObjects } from "../utils/misc";

/**
 * Экспортируем класс загрузки и наследуем его от класса сцены**/
export default class Loading extends Scene {
	name = "Loading";

	/**
	 * Метод для загрузки сцены**/
	async load() {
		await this.utils.assetLoader.loadAssetsGroup("Loading");

		const bg = Sprite.from("bgCity");

		const text = new Text("Loading...", {
			fontFamily: "Verdana",
			fontSize: 50,
			fill: "white",
		});

		text.resolution = 2;

		centerObjects(bg, text);

		this.addChild(bg, text);
	}

	/**
	 * асинхронный метод загрузки игры**/
	async start() {
		await this.utils.assetLoader.loadAssetsGroup("Game");
	}
}
