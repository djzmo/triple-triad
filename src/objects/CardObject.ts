import { Scene } from "phaser";
import Card from "../lib/data/Card";
import Element from "../lib/data/Element";
import Player from "../lib/data/Player";
import Color = Phaser.Display.Color;
import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import Sprite = Phaser.GameObjects.Sprite;
import TimelineBuilderConfig = Phaser.Types.Tweens.TimelineBuilderConfig;

export default class CardObject extends Container {
  public static readonly CARD_WIDTH_PX = 200;
  public static readonly CARD_HEIGHT_PX = 200;

  private backgroundShape: Graphics;
  private faceSprite: Sprite;
  private backSprite: Sprite;
  private elementSprite: Sprite;
  private rankContainer: Container;
  private isOpen: boolean;
  private owner: Player;

  constructor(
    scene: Scene,
    card: Card,
    owner: Player,
    isOpen: boolean,
    x: number,
    y: number
  ) {
    super(scene, x, y);

    this.backgroundShape = scene.add.graphics({ x: 0, y: 0 });
    this.backSprite = scene.add
      .sprite(CardObject.CARD_WIDTH_PX / 2, 0, "card-back")
      .setOrigin(0.5, 0);
    this.faceSprite = scene.add
      .sprite(CardObject.CARD_WIDTH_PX / 2, 0, "card." + card.id)
      .setOrigin(0.5, 0);
    this.rankContainer = scene.add.container(0, 0, [
      scene.add
        .bitmapText(
          15,
          5,
          "rank-text",
          CardObject.getRankText(card.ranks.top),
          50
        )
        .setOrigin(0, 0),
      scene.add
        .bitmapText(
          5,
          30,
          "rank-text",
          CardObject.getRankText(card.ranks.left),
          50
        )
        .setOrigin(0, 0),
      scene.add
        .bitmapText(
          25,
          30,
          "rank-text",
          CardObject.getRankText(card.ranks.right),
          50
        )
        .setOrigin(0, 0),
      scene.add
        .bitmapText(
          15,
          55,
          "rank-text",
          CardObject.getRankText(card.ranks.bottom),
          50
        )
        .setOrigin(0, 0),
    ]);

    this.add(this.backgroundShape);
    this.add(this.backSprite);
    this.add(this.faceSprite);
    this.add(this.rankContainer);

    if (card.element != null) {
      this.elementSprite = scene.add
        .sprite(
          CardObject.CARD_WIDTH_PX / 2 + 25,
          10,
          "element-" + Element[card.element].toLowerCase()
        )
        .setScale(0.5)
        .setOrigin(0, 0);
      this.add(this.elementSprite);
    }

    this.toggleFace(isOpen);
    this.toggleOwner(owner);

    scene.add.existing(this);
  }

  toggleFace(isOpen: boolean): void {
    this.isOpen = isOpen;
    if (isOpen) {
      this.backgroundShape.setAlpha(1);
      this.rankContainer.setAlpha(1);
      this.faceSprite.setAlpha(1, 1, 1, 1);
      this.backSprite.setAlpha(0, 0, 0, 0);
    } else {
      this.backgroundShape.setAlpha(0);
      this.rankContainer.setAlpha(0);
      this.faceSprite.setAlpha(0, 0, 0, 0);
      this.backSprite.setAlpha(1, 1, 1, 1);
    }
  }

  toggleOwner(owner: Player): void {
    this.owner = owner;
    if (owner === Player.SELF) {
      const topColor = Color.GetColor(192, 213, 240);
      const bottomColor = Color.GetColor(45, 65, 119);
      this.backgroundShape.fillGradientStyle(
        topColor,
        topColor,
        bottomColor,
        bottomColor,
        1
      );
      this.backgroundShape.fillRect(
        0,
        0,
        CardObject.CARD_WIDTH_PX,
        CardObject.CARD_HEIGHT_PX
      );
    } else {
      const topColor = Color.GetColor(225, 172, 194);
      const bottomColor = Color.GetColor(91, 37, 49);
      this.backgroundShape.fillGradientStyle(
        topColor,
        topColor,
        bottomColor,
        bottomColor,
        1
      );
      this.backgroundShape.fillRect(
        0,
        0,
        CardObject.CARD_WIDTH_PX,
        CardObject.CARD_HEIGHT_PX
      );
    }
  }

  toggleOwnerFlip(owner: Player, config?: TimelineBuilderConfig): void {
    const sourceX = this.x;
    const sourceY = this.y;

    const timeline = this.scene.tweens.createTimeline(config);

    timeline.add({
      targets: this,
      x: sourceX + CardObject.CARD_WIDTH_PX / 2,
      y: sourceY - 40,
      scaleX: 0,
      duration: 125,
      onComplete: () => this.toggleFace(false),
    });

    timeline.add({
      targets: this,
      x: sourceX,
      y: sourceY - 80,
      scaleX: 1,
      duration: 125,
      onComplete: () => this.toggleOwner(owner),
    });

    timeline.add({
      targets: this,
      x: sourceX + CardObject.CARD_WIDTH_PX / 2,
      y: sourceY - 40,
      scaleX: 0,
      duration: 125,
      onComplete: () => this.toggleFace(true),
    });

    timeline.add({
      targets: this,
      x: sourceX,
      y: sourceY,
      scaleX: 1,
      duration: 125,
    });

    timeline.play();
  }

  getOwner(): Player {
    return this.owner;
  }

  private static getRankText(rank: number) {
    return rank === 10 ? "A" : rank.toString();
  }
}
