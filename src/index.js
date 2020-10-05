/**
 * @Juegoman
 *         -y  -z
 *          ^ ^
 *          |/
 *    -x<---+--->+x
 *         /|
 *        V V
 *       +z +y
 */
import Phaser from 'phaser';
import TitleScene from "./TitleScene";
import GameScene from "./GameScene";

let config = {
  type: Phaser.WEBGL,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#989898',
  antialias: false,
};

let game = new Phaser.Game(config);

game.scene.add('title', TitleScene);
game.scene.add('game', GameScene);

game.scene.start('title');