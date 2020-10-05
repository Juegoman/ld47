import getClickedPoint from './getClickedPoint';
import getUnitVec from "./getUnitVec";
import {LEFT_BOUND, RIGHT_BOUND} from "./constants";
import GameModule from "./GameModule";

export default class Weapon extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules);
    this.scene = scene;
    this.activeBullets = [];
    this.bullets = this.camera.createMultiple(40, 'point', 0, false)
      .map((b, i) => new Bullet(i, b, this.frames, this));
    this.wait = 0;
    this.WAIT = 15;
  }
  get activeBulletQty() { return this.activeBullets.length; }
  get bulletPoolQty() { return this.bullets.length; }
  fire(x, y) {
    if (!this.player.alive || this.wait > 0) return;

    let target = getClickedPoint(x, y, this.camera, this.frames);
    const origin = {x: this.player.x, y: this.player.y, z: this.player.z};
    const bullet = this.bullets.pop();
    bullet.fire(getUnitVec(origin, target));
    this.activeBullets.push(bullet);
    this.scene.sound.play('pew');
    this.wait = this.WAIT;
  }
  update() {
    const cleanup = [];
    this.activeBullets.forEach((b) => {
      if (b.update()) cleanup.push(b.id);
    });
    cleanup.forEach(id => {
      const index = this.activeBullets.findIndex(b => b.id === id);
      this.bullets.push(...this.activeBullets.splice(index, 1));
    });
    this.wait -= (this.wait > 0) ? 1 : 0;
  }
}
export class Bullet {
  constructor(id, bullet, frames, parent) {
    this.id = id;
    this.bullet = bullet;
    this.frames = frames;
    this.parent = parent;
    this.originalRay = null;

    this.BASE_SPEED = 18;
  }
  fire(ray) {
    this.bullet.visible = true;
    this.bullet.x = ray.origin.x;
    this.bullet.y = ray.origin.y;
    this.bullet.z = ray.origin.z;
    this.originalRay = ray;
  }
  update() {
    if (this.originalRay === null) return true;
    this.bullet.x = this.x + (this.originalRay.direction.x * this.bulletSpeed);
    this.bullet.y = this.y - (this.originalRay.direction.y * this.bulletSpeed);
    this.bullet.z = this.z + (this.originalRay.direction.z * this.bulletSpeed);
    if (this.boundsCheck) {
      this.hitspark();
      this.cleanUp();
      return true;
    }
    const targetBoundsCheck = this.targetBoundsCheck
    if (targetBoundsCheck) {
      return this.handleHit(targetBoundsCheck);
    }
    return false;
  }
  hitspark() {
    // todo
  }
  cleanUp() {
    this.bullet.x = 0;
    this.bullet.y = 0;
    this.bullet.z = 0;
    this.originalRay = null;
    this.bullet.visible = false;
  }
  handleHit(target) {
    this.parent.enemy.getById(target).hit();
    this.hitspark();
    this.cleanUp();
    return true;
  }
  get bulletSpeed() {
    return this.BASE_SPEED;
  }
  get targetBoundsCheck() {
    const hit = this.parent.enemy.enemyList.filter(enemy => {
      const { x, y, z } = this;
      const target = {x: enemy.x, y: enemy.y, z: enemy.z};
      const full = { x: target.x - x, y: target.y - y, z: target.z - z };
      const distance = Math.sqrt(full.x**2 + full.y**2 + full.z**2);
      return distance < 30;
    });
    return (hit.length > 0) ? hit[0].id : null;
  }
  get boundsCheck() {
    const frame = this.frames.findClosestFrame(this.z);
    return this.x < LEFT_BOUND - 10 ||
      this.x > RIGHT_BOUND + 10 ||
      this.y < frame.ceiling.y + 25 ||
      this.y > frame.ground.y - 25;
  }
  get x() {
    return this.bullet.x;
  }
  get y() {
    return this.bullet.y;
  }
  get z() {
    return this.bullet.z;
  }
}