import {LEFT_BOUND, PLAYER_Y, PLAYER_Z, RIGHT_BOUND} from './constants';
import Phaser from 'phaser';
import GameModule from './GameModule';

export default class Player extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules);
    this.scene = scene;
    this.legs = this.camera.create(0, -48, 600, 'character', 0);
    this.torso = this.camera.create(0, -48, 600, 'character', 4);
    this.speed = 3
    this.cursors = scene.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    });
    this.health = 10


    scene.anims.create({
      key: 'walk',
      frames: scene.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
      frameRate: 3,
      repeat: -1,
    });
    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
      frameRate: 6,
      repeat: -1,
    });
    this.legs.gameObject.play('walk');
    this.combos = {
      AA: scene.input.keyboard.createCombo('AA', { resetOnMatch: true, maxKeyDelay: 235 }),
      DD: scene.input.keyboard.createCombo('DD', { resetOnMatch: true, maxKeyDelay: 235 }),
    }
    this.dash = {
      wait: 0,
      dir: null,
      step: null,
    }
    scene.input.keyboard.on('keycombomatch', event => {
      const code = event.keyCodes.join('');
      if (code === '6565' && this.dash.wait === 0) {
        this.dash.wait = 100;
        this.dash.dir = 'left';
      } else if (code === '6868' && this.dash.wait === 0) {
        this.dash.wait = 100;
        this.dash.dir = 'right';
      }
    });
  }
  update() {
    if (this.alive) {
      if (this.cursors.left.isDown) {
        this.camera.x -= 4;
      } else if (this.cursors.right.isDown) {
        this.camera.x += 4;
      }
      if (this.dash.dir !== null) {
        if (this.dash.dir === 'left') {
          this.camera.x -= 15;
        } else if (this.dash.dir === 'right') {
          this.camera.x += 15
        }
        if (this.dash.step === null || this.dash.step < 4) {
          this.dash.step = (this.dash.step === null) ? 1 : this.dash.step + 1;
        } else {
          this.dash.step = null;
          this.dash.dir = null;
        }
      }
      if (this.camera.x <= LEFT_BOUND) this.camera.x = LEFT_BOUND;
      if (this.camera.x >= RIGHT_BOUND) this.camera.x = RIGHT_BOUND;
      this.dash.wait = (this.dash.wait === 0) ? 0 : this.dash.wait - 1;

      this.legs.x = this.camera.x;
      this.torso.x = this.camera.x;

      if (this.collidingWithEnemy) {
        this.speed = 0;
        this.legs.gameObject.play('walk', true);
      } else {
        this.speed = 3;
        if (this.cursors.up.isDown) {
          this.speed = 5;
          this.legs.gameObject.play('run', true);
        } else {
          this.legs.gameObject.play('walk', true);
          if (this.cursors.down.isDown) {
            this.speed = 1;
          }
        }
      }

    }
  }
  hit() {
    this.health -= (this.health) ? 1 : 0;
    if (this.health === 0) {
      this.speed = 0;
      this.legs.visible = false;
      this.torso.visible = false;
      this.legs.y = 1000;
      this.torso.y = 1000;
      this.scene.sound.play('explode');
    } else {
      this.scene.sound.play('hit', { volume: 0.5 });
    }
  }

  get alive() {
    return this.health > 0;
  }
  get collidingWithEnemy() {
    const hit = this.enemy.enemyList.filter(enemy => {
      const { x, y, z } = this;
      const target = {x: enemy.x, y: enemy.y, z: enemy.z};
      const full = { x: target.x - x, y: target.y - y, z: target.z - z };
      const distance = Math.sqrt(full.x**2 + full.y**2 + full.z**2);
      return distance < 30 && enemy.alive;
    });
    return hit.length > 0;
  }
  get x() {
    return this.camera.x;
  }
  get y() {
    return PLAYER_Y;
  }
  get z() {
    return PLAYER_Z;
  }
  get coords() {
    return { x: this.x, y: this.y, z: this.z };
  }
}