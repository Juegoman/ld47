import EnemyBullet from "./EnemyBullet";

export default class EnemyBase {
  constructor(id, sprite3d, parent, type = 'base') {
    this.id = id;
    this.sprite = sprite3d;
    this.parent = parent;
    this.activeBullets = []
    this.bullets = this.camera.createMultiple(15, 'enemybullet', 0, false)
      .map((b, i) => new EnemyBullet(i, b, this.frames, this));
    this.TYPE = type;
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
  get x() { return this.sprite.x; }
  setX(x) { this.sprite.x = x; }
  get y() { return this.sprite.y; }
  setY(y) { this.sprite.y = y; }
  get z() { return this.sprite.z; }
  setZ(z) { this.sprite.z = z; }
  get coords() { return {x: this.x, y: this.y, z: this.z}; }
  get currentFrame() { return this.frames.findClosestFrame(this.z); }
  get frames() { return this.parent.frames; }
  get camera() { return this.parent.camera; }
  get player() { return this.parent.player; }
  get hitspark() { return this.parent.hitspark; }
  get scene() { return this.parent.scene; }
}
