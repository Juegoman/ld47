import titleImage from './assets/title.png';
import song from "./assets/LDgametrack.mp3";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'title' });
  }

  preload() {
    this.load.image('title', titleImage);
    this.load.audio('song', song);
  }
  create() {
    this.sound.play('song', { volume: 0.5, loop: true });
    const splash = this.add.image(0, 0, 'title');
    splash.setOrigin(0,0);
    splash.setInteractive({ useHandCursor: true });
    splash.on('pointerdown', () => {
      this.scene.switch('game');
    })
  }
}