import { utils } from "pixi.js"; // импрот утилок из пикси

/**
 * объявляется класс который наследуется от класса EventEmitter и расширяем его,
 * расширяем функционал клавитатуры на приложение
 * **/
export default class Keyboard extends utils.EventEmitter {
	/**
	 * Определяется статическое свойство "instance", которое будет хранить единственный экземпляр класса "Keyboard".
	 * **/
	private static instance: Keyboard;

	/**
	 * Определяются статические свойства "states", "actions", "actionKeyMap",
	 * "allKeys" и "keyActionMap", которые будут использоваться для удобства работы с клавишами и действиями.**/
	static states = {
		ACTION: "ACTION",
	};

	static actions = {
		UP: "UP",
		DOWN: "DOWN",
		LEFT: "LEFT",
		RIGHT: "RIGHT",
		JUMP: "JUMP",
		SHIFT: "SHIFT",
	} as const;

	static actionKeyMap = {
		[Keyboard.actions.UP]: ["KeyW"],
		[Keyboard.actions.DOWN]: ["KeyS"],
		[Keyboard.actions.LEFT]: ["KeyA", "ArrowLeft"],
		[Keyboard.actions.RIGHT]: ["KeyD", "ArrowRight"],
		[Keyboard.actions.JUMP]: ["Space", "ArrowUp"],
		[Keyboard.actions.SHIFT]: ["ShiftLeft", "KeyF"],
	} as const;

	static allKeys = Object.values(Keyboard.actionKeyMap).flat();

	static keyActionMap = Object.entries(Keyboard.actionKeyMap).reduce(
		(acc, [key, actions]) => {
			actions.forEach((action) => {
				acc[action] = key as keyof typeof Keyboard.actions;
			});
			return acc;
		},
		{} as Record<string, keyof typeof Keyboard.actions>
	);

	private keyMap = new Map<string, boolean>();

	private constructor() {
		super();

		this.listenToKeyEvents();
	}

	private listenToKeyEvents() {
		document.addEventListener("keydown", (e) => this.onKeyPress(e.code));
		document.addEventListener("keyup", (e) => this.onKeyRelease(e.code));
	}

	public static getInstance(): Keyboard {
		if (!Keyboard.instance) {
			Keyboard.instance = new Keyboard();
		}

		return Keyboard.instance;
	}

	public getAction(action: keyof typeof Keyboard.actions): boolean {
		const keys = Keyboard.actionKeyMap[action];
		return keys.some((key) => this.isKeyDown(key));
	}

	public onAction(
		callback: (e: {
			action: keyof typeof Keyboard.actions;
			buttonState: "pressed" | "released";
		}) => void
	): void {
		this.on(Keyboard.states.ACTION, callback);
	}

	private onKeyPress(key: string): void {
		if (this.isKeyDown(key) || !(key in Keyboard.keyActionMap)) return;

		this.keyMap.set(key, true);

		this.emit(Keyboard.states.ACTION, {
			action: Keyboard.keyActionMap[key],
			buttonState: "pressed",
		});
	}

	private onKeyRelease(key: string): void {
		if (!this.isKeyDown(key) || !(key in Keyboard.keyActionMap)) return;

		this.keyMap.set(key, false);

		this.emit(Keyboard.states.ACTION, {
			action: Keyboard.keyActionMap[key],
			buttonState: "released",
		});
	}

	public isKeyDown(key: string): boolean {
		return this.keyMap.get(key) || false;
	}
}
