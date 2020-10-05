import GameModule from './GameModule';
import Turret from './Turret';
import getRndInteger from './getRndInteger';

export default class Enemy extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules)
    this.scene = scene;
    this.enemyList = [];
    this.turrets = this.camera.createMultiple(10, 'turret', 0, false)
      .map((t, i) => new Turret(i, t, this));
    this.nextEnemyFrame = 100;
  }
  update() {
    if (this.nextEnemyFrame < this.frames.distanceTravelled) {
      this.enemyList.push(this.pickEnemy().spawn());
      this.nextEnemyFrame += 20;
    }

    const cleanup = [];
    this.enemyList.forEach(enemy => {
      if(enemy.update()) cleanup.push(enemy.id);
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
