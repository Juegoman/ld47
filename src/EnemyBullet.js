import { Bullet } from './Weapon';

export default class EnemyBullet extends Bullet {
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
    const target = {x: this.parent.player.x, y: this.parent.player.y, z: this.parent.player.z};
    const full = { x: target.x - x, y: target.y - y, z: target.z - z };
    const distance = Math.sqrt(full.x**2 + full.y**2 + full.z**2);
    return distance < 5;
  }
}