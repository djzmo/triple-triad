import { Scene } from "phaser";
import Card from "../lib/data/Card";
import CardObject from "./CardObject";
import Player from "../lib/data/Player";
import Container = Phaser.GameObjects.Container;
import CursorObject from "./CursorObject";
import TimelineBuilderConfig = Phaser.Types.Tweens.TimelineBuilderConfig;
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;

export default class HandObject extends Container {
  private static readonly CARD_SPREAD_BETWEEN_CARD_MS = 75;

  private supposedX: number;
  private supposedY: number;

  constructor(
    scene: Scene,
    cards: Card[],
    owner: Player,
    isOpen: boolean,
    isInitiallyHidden: boolean,
    x: number,
    y: number
  ) {
    super(scene, x, y);

    this.supposedX = x;
    this.supposedY = y;

    for (const card of cards) {
      const y = isInitiallyHidden
        ? scene.cameras.main.height
        : (this.list.length * CardObject.CARD_HEIGHT_PX) / 2;
      const cardObject = new CardObject(scene, card, owner, isOpen, 0, y);
      this.add(cardObject);
    }

    scene.add.existing(this);
  }

  spread(config?: TimelineBuilderConfig): void {
    this.hide();
    this.createSpreadTween(config).play();
  }

  hide(): void {
    this.list.map((child: CardObject) => {
      child.x = 0;
      child.y = this.scene.cameras.main.height;
    });
  }

  deselectAll(): void {
    for (const child of this.list) {
      const cardObject = <CardObject>child;
      if (cardObject.x !== 0) {
        this.scene.tweens.add({
          targets: cardObject,
          duration: 100,
          x: 0,
        });
      }
    }
  }

  select(index: number, cursor?: CursorObject): void {
    if (index >= this.list.length) {
      return;
    }

    const selectedObject = <CardObject>this.list[index];
    cursor?.setPosition(
      this.x - 20,
      this.y + selectedObject.y + CardObject.CARD_HEIGHT_PX / 2
    );

    this.deselectAll();
    this.createSelectTween(selectedObject).play();
  }

  thinkingSelect(index: number, config?: TimelineBuilderConfig): void {
    if (index >= this.list.length) {
      return;
    }

    const timeline = this.scene.tweens.createTimeline(config);
    const objectQueue: CardObject[] = [...(<CardObject[]>this.list)];

    if (index != this.list.length - 1) {
      objectQueue.push(<CardObject>this.list[index]);
    }

    for (const cardObject of objectQueue) {
      timeline.queue(this.createSelectTween(cardObject));
      timeline.queue(this.createDeselectTween(cardObject, { delay: 150 }));
    }

    timeline.play();
  }

  draw(cardIndex: number, config?: Partial<TweenBuilderConfig>): void {
    if (cardIndex >= this.list.length) {
      return;
    }

    this.scene.sound.play("card");

    const selectedObject = <CardObject>this.list[cardIndex];

    const onCompleteCb = config.onComplete;
    config.onComplete = (tween, targets, param) => {
      this.remove(this.list[cardIndex]);

      if (onCompleteCb) {
        onCompleteCb(tween, targets, param);
      }
    };

    const priorObjects = this.list.slice(0, cardIndex);

    for (const object of priorObjects) {
      this.scene.tweens.add({
        targets: object,
        y: "+=" + CardObject.CARD_WIDTH_PX / 2,
        duration: 200,
      });
    }

    this.scene.tweens.add({
      targets: selectedObject,
      duration: 200,
      y: -CardObject.CARD_HEIGHT_PX,
      origin: 1,
      ...config,
    });
  }

  bringToFront(): void {
    this.list.map((object) => {
      this.bringToTop(object);
    });
  }

  private createSelectTween(
    cardObject: CardObject,
    config?: Partial<TweenBuilderConfig>
  ) {
    return this.scene.tweens.create({
      targets: cardObject,
      duration: 100,
      x: cardObject.getOwner() === Player.SELF ? -40 : 40,
      ...config,
    });
  }

  private createDeselectTween(
    cardObject: CardObject,
    config?: Partial<TweenBuilderConfig>
  ) {
    return this.scene.tweens.create({
      targets: cardObject,
      duration: 100,
      x: 0,
      ...config,
    });
  }

  private createSpreadTween(config?: TimelineBuilderConfig) {
    const timeline = this.scene.tweens.createTimeline(config);

    let cardIndex = 0;
    for (const child of this.list) {
      timeline.add({
        targets: child,
        x: 0,
        y: (cardIndex++ * CardObject.CARD_HEIGHT_PX) / 2,
        duration: HandObject.CARD_SPREAD_BETWEEN_CARD_MS,
        ease: "Sine.easeOut",
        onStart: () => {
          this.scene.sound.play("card");
        },
      });
    }

    return timeline;
  }
}
