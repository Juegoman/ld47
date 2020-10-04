import getClickedPoint from './getClickedPoint';
import {LEFT_BOUND, RIGHT_BOUND} from "./constants";

export default class Weapon {
  constructor(camera, frames) {
    this.frames = frames;
    this.camera = camera;
    this.activeBullets = [];
    this.bullets = camera.createMultiple(30, 'point', 0, false)
      .map((b, i) => {
        b.id = i;
        return b;
      });
    this.wait = 0;
    this.BULLET_SPEED = 18;
  }
  get activeBulletQty() { return this.activeBullets.length; }
  get bulletPoolQty() { return this.bullets.length; }
  fire(x, y) {
    if (this.wait > 0) { return; }

    let target = getClickedPoint(x, y, this.camera, this.frames);

    const origin = {x: this.camera.x, y: -60, z: 600};
    const unSimple = { x: target.x - origin.x, y: target.y - origin.y, z: target.z - origin.z }
    const distance = Math.sqrt(unSimple.x**2 + unSimple.y**2 + unSimple.z**2);
    // invert y because we live in clown world
    const direction = { x: unSimple.x / distance, y: -unSimple.y / distance, z: unSimple.z / distance };
    let ray = { origin, direction, target};

    const bullet = this.bullets.pop();
    bullet.visible = true;
    bullet.x = ray.origin.x;
    bullet.y = ray.origin.y;
    bullet.z = ray.origin.z;
    bullet.originalRay = ray;
    this.activeBullets.push(bullet);
    this.wait = 15;
  }
  update() {
    const cleanup = [];
    this.activeBullets.forEach((b) => {
      b.x = b.x + (b.originalRay.direction.x * this.BULLET_SPEED);
      b.y = b.y - (b.originalRay.direction.y * this.BULLET_SPEED);
      b.z = b.z + (b.originalRay.direction.z * this.BULLET_SPEED);
      if (this.boundsCheck(b)) {
        this.hitspark(b);
        b.x = 0;
        b.y = 0;
        b.z = 0;
        b.visible = false;
        cleanup.push(b.id);
      }
    });
    cleanup.forEach(id => {
      const index = this.activeBullets.findIndex(b => b.id === id);
      this.bullets.push(...this.activeBullets.splice(index, 1));
    });
    this.wait -= (this.wait > 0) ? 1 : 0;
  }
  boundsCheck(bullet) {
    const frame = this.frames.findClosestFrame(bullet.z);
    return bullet.x < LEFT_BOUND - 10 ||
      bullet.x > RIGHT_BOUND + 10 ||
      bullet.y < frame.ceiling.y + 25 ||
      bullet.y > frame.ground.y - 25;
  }
  hitspark(bullet) {
    // todo
  }
}