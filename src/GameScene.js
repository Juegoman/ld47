import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import characterImage from './assets/guy.png';
import turretImage from './assets/turret.png';
import droneImage from './assets/droneludum2020.png';
import trooperImage from './assets/trooper.png';
import hitsparkImage from './assets/hitspark.png';
import pointImage from './assets/point.png';
import enemyBulletImage from './assets/orangedot.png';
import song from './assets/LDgametrack.mp3';
import pewSound from './assets/shoot.wav';
import bangSound from './assets/gunshot.wav';
import explodeSound from './assets/explode.wav';
import hitSound from './assets/hit.wav';
import Frames from './Frames';
import Player from './Player';
import Enemy from './Enemy';
import Weapon from './Weapon';
import HitsparkManager from './Hitspark';
import makeBar from './makeBar';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
    this.healthText = null;
    this.dashText = null;
    this.deathText = null;
    this.scoreText = null;
    this.gameModules = {
      camera: null,
      frames: null,
      player: null,
      weapon: null,
      enemy: null,
      hitspark: null,
    }
  }
  preload () {
    this.load.spritesheet('strip', checkerboard, { frameWidth: 160, frameHeight: 50 });
    this.load.spritesheet('vertstrip', verticalCheckerboard, { frameWidth: 64, frameHeight: 160 });
    this.load.spritesheet('character', characterImage, { frameWidth: 32, frameHeight: 56 });
    this.load.spritesheet('turret', turretImage, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('drone', droneImage, { frameWidth: 68, frameHeight: 43 });
    this.load.spritesheet('trooper', trooperImage, { frameWidth: 30, frameHeight: 58 });
    this.load.spritesheet('hitspark', hitsparkImage, { frameWidth: 40, frameHeight: 40, endFrame: 4 });
    this.load.image('point', pointImage);
    this.load.image('enemybullet', enemyBulletImage);
    this.load.audio('song', song);
    this.load.audio('pew', pewSound);
    this.load.audio('bang', bangSound);
    this.load.audio('explode', explodeSound);
    this.load.audio('hit', hitSound);
  }
  create () {
    this.gameModules.camera = this.cameras3d
      .addPerspectiveCamera(80)
      .setPosition(0, -100, 720)
      .setPixelScale(48);
    this.gameModules.frames = new Frames(this.gameModules);
    this.gameModules.player = new Player(this.gameModules, this);
    this.gameModules.enemy = new Enemy(this.gameModules, this);
    this.gameModules.weapon = new Weapon(this.gameModules, this);
    this.gameModules.hitspark = new HitsparkManager(this.gameModules, this);

    this.sound.stopAll();
    this.sound.play('song', { volume: 0.5, loop: true });

    this.healthText = this.add.text(5, 580, '', { font: '16px Courier', fill: '#00ff00' });
    this.dashText = this.add.text(5, 560, '', { font: '16px Courier', fill: '#00ffc4' });
    this.scoreText = this.add.text(5, 540, '', { font: '16px Courier', fill: '#00ff00' });

    this.sys.canvas.addEventListener('click', () => {
      if (this.sys.isPaused())  {
        this.sys.resume();
        this.sound.play('song', { volume: 0.5, loop: true });
      }
    });
    document.addEventListener('keypress', () => {
      if (!this.gameModules.player.alive) {
        this.deathText.destroy();
        this.deathText = null;
        this.sound.stopAll();
        this.scene.restart();
      }
    })
  }
  update() {
    //  Scroll the frames
    this.gameModules.frames.update();
    this.gameModules.player.update();
    if (this.input.mousePointer.primaryDown) {
      if (this.input.mousePointer.x <= 800 &&
        this.input.mousePointer.x >= 0 &&
        this.input.mousePointer.y <= 600 &&
        this.input.mousePointer.y >= 0) {
        this.gameModules.weapon.fire(this.input.mousePointer.x, this.input.mousePointer.y);
      } else if (!this.sys.isPaused()) {
        this.sys.pause();
        this.sound.stopAll();
      }
    }

    this.gameModules.weapon.update();
    this.gameModules.enemy.update();
    this.gameModules.camera.update();
    this.gameModules.hitspark.update();

    this.healthText.setText(`HEALTH  ${makeBar(this.gameModules.player.health / 10)}`);
    this.dashText.setText(`  DASH  ${makeBar((100 - this.gameModules.player.dash.wait) / 100)}`);
    this.scoreText.setText(` SCORE  ${this.gameModules.player.score} ${(this.gameModules.player.hyperMode) ? 'HYPER MODE' : ''}`);

    if (!this.gameModules.player.alive && this.deathText === null) {
      this.deathText = this.add.text(180, 200, '', { backgroundColor: '#646161', font: '32px Arial', fill: '#f6451a', align: 'center', padding: { x: 20, y: 20 } });
      this.deathText.setText([
        'You Died',
        'Restart by pressing space',
      ]);
    }
  }
}