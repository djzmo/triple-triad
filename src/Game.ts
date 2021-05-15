import "phaser";
import BoardScene from "./scenes/BoardScene";

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: "#000",
  width: 1200,
  height: 700,
  scene: [BoardScene],
  audio: {
    disableWebAudio: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
});
