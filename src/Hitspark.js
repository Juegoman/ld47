import GameModule from './GameModule';

export default class HitsparkManager extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules)
    this.pool = this.camera.createMultiple(30, 'hitspark', 0, false)
      .map((h, i) => new Hitspark(i, h));
    this.scene = scene;
    this.activeHitsparks = [];
    scene.anims.create({
      key: 'hitspark',
      frames: scene.anims.generateFrameNumbers('hitspark', { frames: [0, 1, 2, 3, 4] }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
    });
  }
  update() {
    const cleanup = []
    this.activeHitsparks.forEach(h => {
      if (!h.active) cleanup.push(h.id);
    })
    cleanup.forEach(id => {
      const index = this.activeHitsparks.findIndex(h => h.id === id);
      this.activeHitsparks[index].sprite.y = 100;
      this.pool.push(...this.activeHitsparks.splice(index, 1));
    })
  }
  spawn(x, y, z) {
    this.activeHitsparks.push(this.pool.pop().spawn(x, y, z));
  }
}

export class Hitspark {
  constructor(id, sprite) {
    this.sprite = sprite;
  }
  spawn(x, y, z) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.z = z;
    this.sprite.gameObject.play('hitspark');
    return this;
  }
  get active() {
    return this.sprite.gameObject.anims.isPlaying;
  }
}


