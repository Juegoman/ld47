import {DEPTH, LEFT_BOUND, RIGHT_BOUND} from './constants';
import getUnitVec from './getUnitVec';
import getRndInteger from './getRndInteger';
import EnemyBase from './EnemyBase';

export default class Turret extends EnemyBase {
  constructor(id, sprite3d, parent) {
    super(`t${id}`, sprite3d, parent, 'turret');
    this.orientation = 'down';
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.sleepTimer = 100;
    this.health = 4;

    this.SPRITESHEET = {
      down: 0,
      downDead: 1,
      right: 2,
      rightDead: 3,
      up: 4,
      upDead: 5,
      left: 6,
      leftDead: 7,
    };
    this.DIRECTIONS = ['up', 'down', 'left', 'right'];
  }
  spawn() {
    this.randomizeOffsets();
    this.randomizeOrientation();
    this.activate();
    return this;
  }
  hit() {
    if (this.alive) {
      this.health -= (this.health) ? 1 : 0;
      if (this.health === 0) {
        this.sprite.gameObject.setFrame(this.SPRITESHEET[`${this.orientation}Dead`]);
        this.scene.sound.play('explode');
      } else {
        this.scene.sound.play('hit', { volume: 0.5 });
      }
    }
  }
  get alive() {
    return this.health > 0;
  }
  update() {
    if (!this.active) return true;
    this.setZ(this.z + this.parent.player.speed);
    this.setY();
    if (this.alive) {
      if (this.sleepTimer > 0) {
        this.sleepTimer -= 1;
      } else {
        this.fire();
        this.sleepTimer = 100
      }
    }
    return this.z > (this.camera.z + DEPTH);
  }
  fire() {
    if (this.sleepTimer > 0) return;
    const target = {x: this.player.x, y: this.player.y, z: this.player.z};
    const origin = {x: this.x, y: this.y, z: this.z};
    if (origin.z - target.z < 0) {
      const bullet = this.bullets.pop();
      bullet.fire(getUnitVec(origin, target));
      this.activeBullets.push(bullet);
      this.scene.sound.play('bang');
    }
  }
  randomizeOffsets() {
    this.verticalOffset = getRndInteger(-100, 100);
    this.horizontalOffset = getRndInteger(-150, 150);
  }
  get active() {
    return this.sprite.visible && this.player.alive;
  }
  activate(value = true) {
    this.sleepTimer = 100;
    this.sprite.visible = value;
    if (value) {
      this.health = 4;
      this.setZ(this.frames.startZ);
    }
  }
  randomizeOrientation() {
    this.setOrientation(this.DIRECTIONS[getRndInteger(0, 3)]);
  }
  setOrientation(direction) {
    this.orientation = direction;
    this.sprite.gameObject.setFrame(this.SPRITESHEET[direction]);
    this.setX()
  }
  get calculatedX() {
    switch (this.orientation) {
      case 'left':
        return LEFT_BOUND - 10;
      case 'right':
        return RIGHT_BOUND + 10;
      case 'up':
      case 'down':
        return this.horizontalOffset;
      default:
        return 0;
    }
  }
  get calculatedY() {
    switch (this.orientation) {
      case 'up':
        return this.currentFrame.ceiling.y + 35;
      case 'down':
        return this.currentFrame.ground.y - 30;
      case 'left':
      case 'right':
        return this.currentFrame.lWall.y + this.verticalOffset;
      default:
        return 0;
    }
  }
  setX() { this.sprite.x = this.calculatedX; }
  setY() { this.sprite.y = this.calculatedY; }
}