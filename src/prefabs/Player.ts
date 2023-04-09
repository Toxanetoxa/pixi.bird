import gsap from "gsap";
import { Container } from "pixi.js";
import Animation from "./Animation";
import Keyboard from "../core/Keyboard";
import { wait } from "../utils/misc";

enum Directions {
  LEFT = -1,
  RIGHT = 1,
}

type AnimState = {
  anim: string;
  soundName?: string;
  loop?: boolean;
  speed?: number;
};


/**
 * Пример класса, демонстрирующий использование классов ```Анимация``` и ```Клавиатура```
 * класс плеер наследуется от класса контейнер
 */
export class Player extends Container {
  /**
   * В классе Player определено приватное свойство keyboard, которое инициализируется
   * экземпляром класса Keyboard, полученным через вызов статического метода getInstance().
   * Представляет собой обертку над нативными событиями клавиатуры в браузере, позволяющую
   * удобно работать с клавиатурными событиями в приложении на PixiJS.
   * **/
  private keyboard = Keyboard.getInstance();
  /**
   * anim - это свойство типа Animation, которое представляет анимацию для объекта Player.
   * Cкорее всего, представляет собой класс, который управляет проигрыванием анимации объекта на сцене.
   * **/
  anim: Animation;
  /**
   * currentState - это свойство типа AnimState | null, которое представляет текущее состояние анимации объекта Player.
   * Представляет собой перечисление (enum), которое содержит возможные состояния анимации объекта
   * (например, "идет", "стоит", "прыгает" и т.д.). Значение свойства currentState может быть равно либо одному из
   * элементов перечисления AnimState, либо null, если текущее состояние анимации неизвестно или не задано.
   * **/
  currentState: AnimState | null = null;

  /**свойство animStates, которое представляет объект типа Record<string, AnimState>.**/

  static animStates: Record<string, AnimState> = {
    /**
     * idle - объект, который описывает анимацию в состоянии покоя (idle).
     * Объект содержит свойства anim (название анимации),
     * loop (флаг, указывающий, что анимация должна повторяться в цикле)
     * speed (скорость проигрывания анимации).
     * **/
    idle: {
      anim: "idle",
      loop: true,
      speed: 0.3,
    },
    /**
     * jump - объект, который описывает анимацию в состоянии прыжка (jump).
     * Объект содержит свойства anim (название анимации),
     * soundName (название звукового эффекта, который должен проигрываться вместе с анимацией),
     * loop (флаг, указывающий, что анимация не должна повторяться в цикле)
     * speed (скорость проигрывания анимации).
     * **/
    jump: {
      anim: "jump",
      soundName: "jump2",
      loop: false,
      speed: 0.5,
    },
    /**
     * walk - объект, который описывает анимацию в состоянии ходьбы (walk).
     * Объект содержит свойства anim (название анимации),
     * loop (флаг, указывающий, что анимация должна повторяться в цикле)
     * speed (скорость проигрывания анимации).
     **/
    walk: {
      anim: "walk",
      loop: true,
      speed: 1,
    },
    /**
     * dash - объект, который описывает анимацию в состоянии быстрого бега (dash).
     * Объект содержит свойства anim (название анимации),
     * soundName (название звукового эффекта, который должен проигрываться вместе с анимацией),
     * loop (флаг, указывающий, что анимация не должна повторяться в цикле)
     * speed (скорость проигрывания анимации).
     * **/
    dash: {
      anim: "dash",
      soundName: "dash",
      loop: false,
      speed: 1,
    },
  };

  config = {
    speed: 10,
    turnDuration: 0.15,
    decelerateDuration: 0.1,
    scale: 1,
    jump: {
      height: 10,
      duration: 0.3,
      ease: "sine",
    },
    dash: {
      speedMultiplier: 6,
      duration: 0.1,
    },
  };

  state = {
    jumping: false,
    dashing: false,
    velocity: {
      x: 0,
      y: 0,
    },
  };

  /**
   * объявляет приватное свойство, которое может содержать объект Tween из библиотеки GSAP
   * **/
  private decelerationTween?: gsap.core.Tween;

  /**
   * конструктор класса Player, который является наследником класса
   * PIXI.Container и предназначен для создания объекта игрока на сцене игры.
   * **/
  constructor() {

    /**
     * ызывается конструктор родительского класса PIXI.Container
     * через ключевое слово super, чтобы установить родительские свойства и методы;
     * **/
    super();

    /**
     * создается новый объект anim класса Animation с параметром "wizard".
     * Класс Animation определяет анимацию объекта на основе текстур и временной шкалы;
     * **/
    this.anim = new Animation("wizard");

    /**
     * добавляется объект anim в дочерние элементы контейнера через метод addChild();
     * **/
    this.addChild(this.anim);

    /**
     * устанавливается начальное состояние анимации объекта с помощью метода setState(),
     * передавая ему значение Player.animStates.idle, которое указывает на состояние покоя;
     * **/
    this.setState(Player.animStates.idle);

    /**
     * устанавливается обработчик событий клавиатуры через метод onAction(), который вызывает методы onActionPress() и
     * onActionRelease() при нажатии и отпускании клавиш соответственно.**/
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState === "pressed") this.onActionPress(action);
      else if (buttonState === "released") this.onActionRelease(action);
    });
  }

   /**изменяет состояние анимации объекта игрока и запускать соответствующую анимацию при помощи метода setState().**/
  setState(state: AnimState) {
    this.currentState = state;

    return this.anim.play(state);
  }

  private onActionPress(action: keyof typeof Keyboard.actions) {
    switch (action) {
      case "LEFT":
        this.move(Directions.LEFT);
        break;
      case "RIGHT":
        this.move(Directions.RIGHT);
        break;
      case "JUMP":
        this.jump();
        break;
      case "SHIFT":
        this.dash();
        break;

      default:
        break;
    }
  }
  /**
   * Данный код обрабатывает событие отпускания клавиши на клавиатуре для действий,
   * определенных в объекте Keyboard.actions.
   * Функция принимает строковый аргумент action, который является ключом объекта Keyboard.actions.
   * Выполняет остановку движения объекта в случае отпускания клавиши, если объект двигался в соответствующем направлении.**/

  onActionRelease(action: keyof typeof Keyboard.actions) {
    if (
      (action === "LEFT" && this.state.velocity.x < 0) ||
      (action === "RIGHT" && this.state.velocity.x > 0)
    ) {
      this.stopMovement();
    }
  }

  /**
   * геттер для jumping**/

  get jumping() {
    return this.state.jumping;
  }

  /**приватный сеттер jumping, который устанавливает значение флага
   * jumping в объекте state и вызывает метод updateAnimState()
   * для обновления анимации объекта.**/
  private set jumping(value: boolean) {
    this.state.jumping = value;
    this.updateAnimState();
  }

  /**
   *приватный сеттер dashing, который устанавливает значение флага
   *    * dashing в объекте state и вызывает метод updateAnimState()
   *    * для обновления анимации объекта.
   **/
  private set dashing(value: boolean) {
    this.state.dashing = value;
    this.updateAnimState();
  }

  /**
   * геттер для dashing **/
  get dashing() {
    return this.state.dashing;
  }


  /**
   * приватный метод устанавления состояния объекта бег, деш, прыжок, стоять
   * **/
  private updateAnimState() {
    const { walk, jump, dash, idle } = Player.animStates;

    if (this.dashing) {
      if (this.currentState === dash) return;

      this.setState(dash);
    } else if (this.jumping) {
      if (this.currentState === jump || this.currentState === dash) return;

      this.setState(jump);
    } else if (this.state.velocity.x !== 0) {
      if (this.currentState === walk) return;

      this.setState(walk);
    } else {
      if (this.currentState === idle) return;

      this.setState(idle);
    }
  }

  stopMovement() {
    this.decelerationTween?.progress(1);

    this.decelerationTween = gsap.to(this.state.velocity, {
      duration: this.config.decelerateDuration,
      x: 0,
      ease: "power1.in",
      onComplete: () => {
        this.updateAnimState();
      },
    });
  }

  /**
   * ассинхронный метод бега
   * **/
  async move(direction: Directions) {
    if (this.dashing) return;

    this.decelerationTween?.progress(1);

    this.state.velocity.x = direction * this.config.speed;

    this.updateAnimState();

    gsap.to(this.scale, {
      duration: this.config.turnDuration,
      x: this.config.scale * direction,
    });
  }

  /**
   * асинхронный метод деша**/
  async dash() {
    if (this.state.velocity.x === 0) return;

    this.dashing = true;

    this.decelerationTween?.progress(1);

    this.state.velocity.x =
      this.config.speed *
      this.config.dash.speedMultiplier *
      this.getDirection();

    await wait(this.config.dash.duration);

    this.state.velocity.x = this.config.speed * this.getDirection();

    this.dashing = false;
  }

  /**
   * приватный метод определения стороы в которую смотрит персонаж
   * **/
  private getDirection() {
    if (this.state.velocity.x === 0)
      return this.scale.x > 0 ? Directions.RIGHT : Directions.LEFT;

    return this.state.velocity.x > 0 ? Directions.RIGHT : Directions.LEFT;
  }

  /**
   * асинхронный метод прыжка
   * **/
  async jump() {
    if (this.jumping) return;

    const { height, duration, ease } = this.config.jump;

    this.jumping = true;

    await gsap.to(this, {
      duration,
      y: `-=${height}`,
      ease: `${ease}.out`,
      yoyo: true,
      yoyoEase: `${ease}.in`,
      repeat: 1,
    });

    this.jumping = false;
  }
}
