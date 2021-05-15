import { Scene } from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import Timeline = Phaser.Tweens.Timeline;

export default class CursorObject extends Sprite {
  private holdTimeline: Timeline;

  constructor(scene: Scene, x: number, y: number, key: string) {
    super(scene, x, y, key);
    this.setDepth(1);
    scene.add.existing(this);
  }

  show(): void {
    this.release();
    this.setAlpha(1, 1, 1, 1);
  }

  hide(): void {
    this.release();
    this.setAlpha(0, 0, 0, 0);
  }

  hold(): void {
    this.release();

    this.holdTimeline = this.scene.tweens.createTimeline({
      loop: -1,
    });

    this.holdTimeline.add({ targets: this, alpha: 0.25, duration: 25 });
    this.holdTimeline.add({ targets: this, alpha: 0.5, duration: 25 });
    this.holdTimeline.play();
  }

  release(): void {
    if (this.holdTimeline) {
      this.holdTimeline.stop();
      this.holdTimeline.destroy();
      this.holdTimeline = null;
      this.setAlpha(1, 1, 1, 1);
    }
  }

  isVisible(): boolean {
    return this.alpha === 1;
  }

  isHeld(): boolean {
    return !!this.holdTimeline;
  }
}
