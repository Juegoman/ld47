import {LEFT_BOUND, RIGHT_BOUND} from './constants';
import Phaser from 'phaser';
import GameModule from './GameModule';

export default class Player extends GameModule {
  constructor(gameModules, game) {
    super(gameModules);
    this.game = game;
    this.legs = this.camera.create(0, -48, 600, 'character', 0);
    this.torso = this.camera.create(0, -48, 600, 'character', 4);
    this.speed = 3
    this.cursors = game.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    });
    this.health = 10


    game.anims.create({
      key: 'walk',
      frames: game.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
      frameRate: 3,
      repeat: -1,
    });
    game.anims.create({
      key: 'run',
      frames: game.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
      frameRate: 6,
      repeat: -1,
    });
    this.legs.gameObject.play('walk');
    this.combos = {
      AA: game.input.keyboard.createCombo('AA', { resetOnMatch: true, maxKeyDelay: 300 }),
      DD: game.input.keyboard.createCombo('DD', { resetOnMatch: true, maxKeyDelay: 300 }),
    }
    this.dash = {
      wait: 0,
      dir: null,
      step: null,
    }
    game.input.keyboard.on('keycombomatch', event => {
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

      }
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
  hit() {
    this.health -= (this.health) ? 1 : 0;
    if (this.health === 0) {
      this.speed = 0;
      this.legs.visible = false;
      this.torso.visible = false;
      this.legs.y = 1000;
      this.torso.y = 1000;
      this.game.sound.play('explode');
    } else {
      this.game.sound.play('hit');
    }
  }

  get alive() {
    return this.health > 0;
  }
  get collidingWithEnemy() {

  }
}