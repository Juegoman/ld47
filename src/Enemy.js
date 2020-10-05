import {DEPTH, LEFT_BOUND, RIGHT_BOUND} from "./constants";
import { Bullet } from './Weapon';
import getUnitVec from "./getUnitVec";
import GameModule from "./GameModule";

export default class Enemy extends GameModule {
  constructor(gameModules, game) {
    super(gameModules)
    this.game = game;
    this.enemyList = [];
    this.turrets = this.camera.createMultiple(10, 'turret', 0, false)
      .map((t, i) => new Turret(i, t, this.frames, this.camera, this.player, this.game));
    this.nextEnemyFrame = 100;
  }
  update(speed) {
    if (this.nextEnemyFrame < this.frames.distanceTravelled) {
      this.enemyList.push(this.pickEnemy().spawn());
      this.nextEnemyFrame += 20;
    }

    const cleanup = [];
    this.enemyList.forEach(enemy => {
      if(enemy.update({ speed })) cleanup.push(enemy.id);
    })
    cleanup.forEach(id => {
      const index = this.enemyList.findIndex(enemy => enemy.id === id);
      if (this.enemyList[index].TYPE === 'turret') {
        this.enemyList[index].activate(false)
        this.turrets.push(...this.enemyList.splice(index, 1));
      }
    })
    this.allEnemies.forEach(enemy => {
      enemy.updateBullets();
    })
  }
  pickEnemy() {
    const roll = getRndInteger(1, 100);
    return this.turrets.pop();
  }
  getById(id) {
    return this.allEnemies.find(e => e.id === id);
  }
  get allEnemies() {
    return [ ...this.turrets, ...this.enemyList ];
  }
}

class EnemyBullet extends Bullet {
  constructor(id, bullet, frames, parent) {
    super(id, bullet, frames, parent);
    this.BASE_SPEED = 5;
  }
  handleHit() {
    this.parent.player.hit();
    this.hitspark();
    this.cleanUp();
    return true;
  }
  get bulletSpeed() {
    return this.BASE_SPEED + this.parent.player.speed
  }
  get targetBoundsCheck() {
    const { x, y, z } = this;
    const target = {x: this.parent.camera.x, y: -60, z: 600};
    const full = { x: target.x - x, y: target.y - y, z: target.z - z };
    const distance = Math.sqrt(full.x**2 + full.y**2 + full.z**2);
    return distance < 5;
  }
}

class Turret {
  constructor(id, sprite3d, frames, camera, player, game) {
    this.id = `t${id}`,
    this.sprite = sprite3d;
    this.frames = frames;
    this.camera = camera;
    this.player = player;
    this.game = game;
    this.orientation = 'down';
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.sleepTimer = 100;
    this.health = 4;
    this.activeBullets = []
    this.bullets = camera.createMultiple(10, 'enemybullet', 0, false)
      .map((b, i) => new EnemyBullet(i, b, frames, this));

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
    this.DIRECTIONS = ['up', 'down', 'left', 'right']
    this.TYPE = 'turret'
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
        this.game.sound.play('explode');
      } else {
        this.game.sound.play('hit');
      }
    }
  }
  get alive() {
    return this.health > 0;
  }
  update({ speed }) {
    if (!this.active) return true;
    this.setZ(this.z + speed);
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
  updateBullets() {
    const cleanup = []
    this.activeBullets.forEach(b => {
      if (b.update()) cleanup.push(b.id);
    })
    cleanup.forEach(id => {
      const index = this.activeBullets.findIndex(b => b.id === id);
      this.bullets.push(...this.activeBullets.splice(index, 1));
    })
  }
  fire() {
    if (this.sleepTimer > 0) return;
    const target = {x: this.camera.x, y: -60, z: 600};
    const origin = {x: this.calculatedX, y: this.calculatedY, z: this.z};
    if (origin.z - target.z < 0) {
      const bullet = this.bullets.pop();
      bullet.fire(getUnitVec(origin, target));
      this.activeBullets.push(bullet);
      this.game.sound.play('bang');
    }
  }
  randomizeOffsets() {
    this.verticalOffset = getRndInteger(-100, 100);
    this.horizontalOffset = getRndInteger(-150, 150);
    // this.verticalOffset = 100;
    // this.horizontalOffset = 150;
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
    // this.setOrientation('down');
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
  get x() { return this.sprite.x; }
  setX() { this.sprite.x = this.calculatedX; }
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
  get y() { return this.sprite.y; }
  setY() { this.sprite.y = this.calculatedY; }
  get z() { return this.sprite.z; }
  setZ(z) { this.sprite.z = z; }
  get currentFrame() {
    return this.frames.findClosestFrame(this.z);
  }
}
// returns a random number between min and max (both included)
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}