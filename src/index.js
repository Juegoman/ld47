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

import Frames from './Frames';
import Weapon from './Weapon';
import Player from './Player';
import Enemy from './Enemy';

import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import characterImage from './assets/guy.png';
import pointImage from './assets/point.png';
import turretImage from './assets/turret.png';
import enemyBulletImage from './assets/orangedot.png';
import song from './assets/LDgametrack.mp3';
import pewSound from './assets/shoot.wav';
import bangSound from './assets/gunshot.wav';

let config = {
  type: Phaser.WEBGL,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#989898',
  antialias: false,
  scene: {
    preload,
    create,
    update,
  }
};

let camera;
let frames;
let player;
let weapon;
let enemy;
let text;
let pauseSongPos = 0;



let game = new Phaser.Game(config);

function preload () {
  this.load.spritesheet('strip', checkerboard, { frameWidth: 160, frameHeight: 50 });
  this.load.spritesheet('vertstrip', verticalCheckerboard, { frameWidth: 64, frameHeight: 160 })
  this.load.spritesheet('character', characterImage, { frameHeight: 56, frameWidth: 32 });
  this.load.spritesheet('turret', turretImage, { frameWidth: 48, frameHeight: 48 });
  this.load.image('point', pointImage);
  this.load.image('enemybullet', enemyBulletImage);
  this.load.audio('song', song);
  this.load.audio('pew', pewSound);
  this.load.audio('bang', bangSound);
}

function create () {
  camera = this.cameras3d.addPerspectiveCamera(80)
      .setPosition(0, -100, 720)
      .setPixelScale(48);
  frames = new Frames(camera);
  player = new Player(camera, this);
  enemy = new Enemy(camera, frames, player, this);
  weapon = new Weapon(camera, frames, enemy, this);

  this.sound.play('song', { volume: 0.5, loop: true });

  text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
  this.sys.canvas.addEventListener('click', () => {
    if (this.sys.isPaused())  {
      this.sys.resume();
      this.sound.play('song', { volume: 0.5, loop: true });
    }
  })
}

function update () {
  //  Scroll the frames
  const speed = player.speed;
  frames.update(speed);
  player.update();
  if (this.input.mousePointer.primaryDown) {
    if (this.input.mousePointer.x <= 800 &&
      this.input.mousePointer.x >= 0 &&
      this.input.mousePointer.y <= 600 &&
      this.input.mousePointer.y >= 0) {
        weapon.fire(this.input.mousePointer.x, this.input.mousePointer.y);
    } else if (!this.sys.isPaused()) {
        this.sys.pause();
        this.sound.stopAll();
    }
  }

  weapon.update();
  enemy.update(speed);
  camera.update();
  text.setText([
    'camera.x: ' + camera.x,
    'dash.wait: ' + player.dash.wait,
    'weapon.wait: ' + weapon.wait,
    'enemy.nextEnemyFrame: ' + enemy.nextEnemyFrame,
    'frames.distanceTravelled: ' + frames.distanceTravelled,
    'health: ' + [...Array(player.health)].map(() => '█').join(''),
  ]);
}
