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
import explodeSound from './assets/explode.wav';
import hitSound from './assets/hit.wav';

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

const gameModules = {
  camera: null,
  frames: null,
  player: null,
  weapon: null,
  enemy: null,
}
let healthText;
let dashText;
let deathText = null;

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
  this.load.audio('explode', explodeSound);
  this.load.audio('hit', hitSound);
}

function create () {
  gameModules.camera = this.cameras3d
    .addPerspectiveCamera(80)
    .setPosition(0, -100, 720)
    .setPixelScale(48);
  gameModules.frames = new Frames(gameModules);
  gameModules.player = new Player(gameModules, this);
  gameModules.enemy = new Enemy(gameModules, this);
  gameModules.weapon = new Weapon(gameModules, this);

  this.sound.play('song', { volume: 0.5, loop: true });

  healthText = this.add.text(5, 580, '', { font: '16px Courier', fill: '#00ff00' });
  dashText = this.add.text(5, 560, '', { font: '16px Courier', fill: '#00ffc4' });

  this.sys.canvas.addEventListener('click', () => {
    if (this.sys.isPaused())  {
      this.sys.resume();
      this.sound.play('song', { volume: 0.5, loop: true });
    }
  });
  document.addEventListener('keypress', () => {
    if (!gameModules.player.alive) {
      deathText.destroy();
      deathText = null;
      this.sound.stopAll();
      this.scene.restart();
    }
  })
}

function update () {
  //  Scroll the frames
  const speed = gameModules.player.speed;
  gameModules.frames.update(speed);
  gameModules.player.update();
  if (this.input.mousePointer.primaryDown) {
    if (this.input.mousePointer.x <= 800 &&
      this.input.mousePointer.x >= 0 &&
      this.input.mousePointer.y <= 600 &&
      this.input.mousePointer.y >= 0) {
       gameModules.weapon.fire(this.input.mousePointer.x, this.input.mousePointer.y);
    } else if (!this.sys.isPaused()) {
        this.sys.pause();
        this.sound.stopAll();
    }
  }

  gameModules.weapon.update();
  gameModules.enemy.update(speed);
  gameModules.camera.update();

  healthText.setText(`HEALTH  ${makeBar(gameModules.player.health / 10)}`);
  dashText.setText(`  DASH  ${makeBar((100 - gameModules.player.dash.wait) / 100)}`);

  if (!gameModules.player.alive && deathText === null) {
    deathText = this.add.text(180, 180, '', { backgroundColor: '#646161', font: '32px Arial', fill: '#f6451a', align: 'center', padding: { x: 20, y: 20 } });
    deathText.setText([
      'You Died',
      'Restart by pressing any key',
    ]);
  }
}

function makeBar(percentage) {
  if (percentage === 0) return '';
  const number = Math.floor(percentage * 74);
  if (number === 0) return '█';
  return [...Array(number)].map(() => '█').join('');
}
