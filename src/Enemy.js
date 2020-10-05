import GameModule from './GameModule';
import Turret from './Turret';
import Drone from './Drone';
import getRndInteger from './getRndInteger';

export default class Enemy extends GameModule {
  constructor(gameModules, scene) {
    super(gameModules)
    this.scene = scene;
    this.enemyList = [];
    this.turrets = this.camera.createMultiple(15, 'turret', 0, false)
      .map((t, i) => new Turret(i, t, this));
    this.drones = this.camera.createMultiple(10, 'drone', 0, false)
      .map((d, i) => new Drone(i, d, this));
    this.nextEnemyFrame = 30;

    scene.anims.create({
      key: 'drone',
      frames: scene.anims.generateFrameNumbers('drone', { frames: [0, 1] }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: 'dronedead',
      frames: scene.anims.generateFrameNumbers('drone', { frames: [2] }),
      repeat: -1,
    })
    // scene.anims.create({
    //   key: 'trooperforward',
    //   frames: scene.anims.generateFrameNumbers('trooper', { frames: [1, 3, 2, 3] }),
    //   frameRate: 5,
    //   repeat: -1,
    // });
    // scene.anims.create({
    //   key: 'trooperrunningback',
    //   frames: scene.anims.generateFrameNumbers('trooper', { frames: [5, 3, 6, 3] }),
    //   frameRate: 5,
    //   repeat: -1,
    // });

  }
  update() {
    if (this.nextEnemyFrame < this.frames.distanceTravelled) {
      if (this.difficulty === 3) {
        let enemy3 = this.pickEnemy();
        if (enemy3) this.enemyList.push(enemy3.spawn());
      }
      if (this.difficulty === 2 && getRndInteger(0, 1)) {
        let enemy2 = this.pickEnemy();
        if (enemy2) this.enemyList.push(enemy2.spawn());
      }
      if (this.difficulty === 1 && getRndInteger(0, 1)) {
        let enemy1 = this.pickEnemy();
        if (enemy1) this.enemyList.push(enemy1.spawn());
      }
      let enemy0 = this.pickEnemy();
      if (enemy0) this.enemyList.push(enemy0.spawn());
      this.nextEnemyFrame += 20;
    }

    const cleanup = [];
    this.enemyList.forEach(e => {
      if(e.update()) cleanup.push(e.id);
    })
    cleanup.forEach(id => {
      const index = this.enemyList.findIndex(e => e.id === id);
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
    this.allEnemies.forEach(e => {
      e.updateBullets();
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
  get difficulty() {
    if (this.player.score > 20000) return 3;
    if (this.player.score > 10000) return 2;
    if (this.player.score > 5000) return 1;
    return 0;
  }
}
