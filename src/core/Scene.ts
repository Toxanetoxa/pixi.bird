import { Container } from "pixi.js";
import type { SceneUtils } from "./SceneManager";

export interface Scene {
  load?(): void | Promise<void>;
  unload?(): void | Promise<void>;
  start?(): void | Promise<void>;
  onResize?(width: number, height: number): void;
}

/**
 * Container в pixi.js - это базовый класс, который представляет собой контейнер для отображения графических объектов. Он содержит следующие свойства и методы:
 *
 * Свойства:
 *
 * children: массив дочерних элементов контейнера.
 * height: высота контейнера.
 * width: ширина контейнера.
 * alpha: прозрачность контейнера.
 * pivot: точка, относительно которой происходит преобразование координат контейнера.
 * position: позиция контейнера на сцене.
 * rotation: угол поворота контейнера в радианах.
 * scale: масштаб контейнера.
 * visible: флаг видимости контейнера.
 * Методы:
 *
 * addChild(child: DisplayObject): DisplayObject: добавление дочернего элемента в контейнер.
 * addChildAt(child: DisplayObject, index: number): DisplayObject: добавление дочернего элемента в контейнер на определенную позицию.
 * contains(child: DisplayObject): boolean: проверка наличия дочернего элемента в контейнере.
 * getChildAt(index: number): DisplayObject: получение дочернего элемента по его индексу.
 * getChildByName(name: string): DisplayObject: получение дочернего элемента по его имени.
 * removeChild(child: DisplayObject): DisplayObject: удаление дочернего элемента из контейнера.
 * removeChildAt(index: number): DisplayObject: удаление дочернего элемента из контейнера по его индексу.
 * removeChildren(beginIndex?: number, endIndex?: number): DisplayObject[]: удаление дочерних элементов из контейнера в заданном диапазоне индексов.
 * render(renderer: Renderer): void: отрисовка контейнера и его дочерних элементов.
 * setChildIndex(child: DisplayObject, index: number): void: изменение индекса дочернего элемента в контейнере.
 * swapChildren(child: DisplayObject, child2: DisplayObject): void: обмен индексами двух дочерних элементов в контейнере.
 * swapChildrenAt(index1: number, index2: number): void: обмен индексами двух дочерних элементов в контейнере по их индексам.**/
export abstract class Scene extends Container {
  abstract name: string;

  constructor(protected utils: SceneUtils) {
    super();
  }
}

export default Scene;
