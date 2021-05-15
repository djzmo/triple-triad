import { Scene } from "phaser";
import Player from "../lib/data/Player";
import Color = Phaser.Display.Color;
import Container = Phaser.GameObjects.Container;
import Triangle = Phaser.GameObjects.Triangle;
import TimelineBuilderConfig = Phaser.Types.Tweens.TimelineBuilderConfig;
import Tween = Phaser.Tweens.Tween;
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;

export default class TurnShapeObject extends Container {
  private static readonly TURN_SHAPE_COLOR = Color.GetColor(255, 255, 0);
  private readonly cardWidth: number;
  private readonly shape: Triangle;
  private yoyoTween: Tween;

  constructor(scene: Scene, cardWidth: number) {
    super(scene, scene.cameras.main.width / 2, -60);
    this.shape = scene.add.triangle(
      0,
      0,
      0,
      0,
      30,
      60,
      60,
      30,
      TurnShapeObject.TURN_SHAPE_COLOR
    );
    this.cardWidth = cardWidth;

    this.add(this.shape);

    scene.add.existing(this);
  }

  switchTurn(turn: Player, config?: Partial<TweenBuilderConfig>): void {
    if (this.yoyoTween) {
      this.scene.tweens.remove(this.yoyoTween);
    }

    if (turn === Player.SELF) {
      this.createTweenToSelf(config).play();
    } else {
      this.createTweenToOpponent(config).play();
    }
  }

  randomizeTurn(turn: Player, config?: TimelineBuilderConfig): void {
    this.createRandomizeTween(turn, config).play();
  }

  private createRandomizeTween(turn: Player, config?: TimelineBuilderConfig) {
    this.x = this.scene.cameras.main.width / 2;
    this.y = this.scene.cameras.main.height / 2;

    this.scene.sound.play("spread");

    const timeline = this.scene.tweens.createTimeline(config);

    timeline.add({
      targets: this,
      angle: 1800 + (turn === Player.SELF ? 90 : 0),
      duration: 1000,
    });

    timeline.queue(
      turn === Player.SELF
        ? this.createTweenToSelf({ delay: 250 })
        : this.createTweenToOpponent({ delay: 250 })
    );

    return timeline;
  }

  private createTweenToOpponent(config?: Partial<TweenBuilderConfig>) {
    const opponentHandX = this.scene.cameras.main.width / 15;
    return this.scene.tweens.create({
      targets: this,
      duration: 250,
      ease: "Sine.easeOut",
      angle: 225,
      x: opponentHandX + this.cardWidth / 2,
      y: 50,
      onComplete: () => {
        this.yoyoTween = this.scene.tweens.add({
          targets: this,
          repeat: -1,
          yoyo: true,
          y: 40,
        });
      },
      ...config,
    });
  }

  private createTweenToSelf(config?: Partial<TweenBuilderConfig>) {
    const gameWidth = this.scene.cameras.main.width;
    const playerHandX = gameWidth - gameWidth / 15 - this.cardWidth;
    return this.scene.tweens.create({
      targets: this,
      duration: 250,
      ease: "Sine.easeOut",
      angle: 225,
      x: playerHandX + this.cardWidth / 2,
      y: 50,
      onComplete: () => {
        this.yoyoTween = this.scene.tweens.add({
          targets: this,
          repeat: -1,
          yoyo: true,
          y: 40,
        });
      },
      ...config,
    });
  }
}
