import Phaser from 'phaser';

import Frames from './Frames';
import Weapon from './Weapon';
import Player from './Player';

import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import characterImage from './assets/guy.png';
import pointImage from './assets/point.png';
import turretImage from './assets/turret.png';
import enemyBulletImage from './assets/orangedot.png';

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
let text;



let game = new Phaser.Game(config);

function preload () {
  this.load.spritesheet('strip', checkerboard, { frameWidth: 160, frameHeight: 50 });
  this.load.spritesheet('vertstrip', verticalCheckerboard, { frameWidth: 64, frameHeight: 160 })
  this.load.spritesheet('character', characterImage, { frameHeight: 56, frameWidth: 32 });
  this.load.spritesheet('turret', turretImage, { frameWidth: 24, frameHeight: 24 });
  this.load.image('point', pointImage);
  this.load.image('enemybullet', enemyBulletImage);
}

function create () {
  camera = this.cameras3d.addPerspectiveCamera(80)
      .setPosition(0, -100, 720)
      .setPixelScale(48);
  frames = new Frames(camera);
  player = new Player(camera, this);
  weapon = new Weapon(camera, frames);

  text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
}

function update () {
  //  Scroll the frames
  frames.update(player.speed);
  player.update();
  if (this.input.mousePointer.primaryDown) {
    weapon.fire(this.input.mousePointer.x, this.input.mousePointer.y);
  }
  weapon.update();
  camera.update();
  text.setText([
    'camera.x: ' + camera.x,
    'dash.wait: ' + player.dash.wait,
    'weapon.wait: ' + weapon.wait,
    'weapon.activeBullets.length: ' + weapon.activeBulletQty,
    'weapon.bullets.length: ' + weapon.bulletPoolQty,
  ]);
}
