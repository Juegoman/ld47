import GameModule from './GameModule';
import Turret from './Turret';
import Drone from './Drone';
import getRndInteger from './getRndInteger';

export default class Enemy extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules)
    this.scene = scene;
    this.enemyList = [];
    this.turrets = this.camera.createMultiple(10, 'turret', 0, false)
      .map((t, i) => new Turret(i, t, this));
    this.drones = this.camera.createMultiple(6, 'drone', 0, false)
      .map((d, i) => new Drone(i, d, this));
    this.nextEnemyFrame = 30;

    scene.anims.create({
      key: 'drone',
      frames: scene.anims.generateFrameNumbers('drone', { frames: [0, 1] }),
      frameRate: 4,
      repeat: -1,
    });
    scene.anims.create({
      key: 'dronedead',
      frames: scene.anims.generateFrameNumbers('drone', { frames: [2] }),
      repeat: -1,
    })
  }
  update() {
    if (this.nextEnemyFrame < this.frames.distanceTravelled) {
      const enemy = this.pickEnemy();
      if (enemy) this.enemyList.push(enemy.spawn());
      this.nextEnemyFrame += 20;
    }

    const cleanup = [];
    this.enemyList.forEach(enemy => {
      if(enemy.update()) cleanup.push(enemy.id);
    })
    cleanup.forEach(id => {
      const index = this.enemyList.findIndex(enemy => enemy.id === id);
      this.enemyList[index].activate(false)
      switch (this.enemyList[index].TYPE) {
        case 'turret':
          this.turrets.push(...this.enemyList.splice(index, 1));
          break;
        case 'drone':
          this.drones.push(...this.enemyList.splice(index, 1));
          break;
        default:
      }
    })
    this.allEnemies.forEach(enemy => {
      enemy.updateBullets();
    })
  }
  pickEnemy() {
    const roll = getRndInteger(1, 100);
    if (roll > 80 && this.drones.length > 0) {
      return this.drones.pop();
    }
    return (this.turrets.length > 0) ? this.turrets.pop() : null;
  }
  getById(id) {
    return this.allEnemies.find(e => e.id === id);
  }
  get allEnemies() {
    return [ ...this.turrets, ...this.enemyList ];
  }
}
