import config from "../config";
import ParallaxBackground from "../prefabs/ParallaxBackground";
import { Player } from "../prefabs/Player";
import Scene from "../core/Scene";

/**
 * Экспортируем класс игры и наследуем его от класса сцены
 * **/
export default class Game extends Scene {
	name = "Game";

	private player: Player | undefined;
	private background: ParallaxBackground | undefined;

	/**
	 * оздается экземпляр класса ParallaxBackground для работы с параллакс-фоном и экземпляр класса Player для работы с игроком.
	 * **/
	load() {
		this.background = new ParallaxBackground(config.background.city);
		this.player = new Player();

		this.player.x = window.innerWidth / 2;
		this.player.y = window.innerHeight - this.player.height / 3;

		/**
		 * Инициализируем движение фона за игроком**/
		this.background.initPlayerMovement(this.player);

		this.addChild(this.background, this.player);
	}

	/**
	 * Метод для обработки изменения размеров экрана**/
	onResize(width: number, height: number) {
		if (this.player) {
			this.player.x = width / 2;
			this.player.y = height - this.player.height / 3;
		}

		if (this.background) {
			this.background.resize(width, height);
		}
	}
}
