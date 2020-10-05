export default class GameModule {
  constructor(gameModules) {
    this.gameModules = gameModules;
  }
  get camera() {
    return this.gameModules.camera;
  }
  get frames() {
    return this.gameModules.frames;
  }
  get player() {
    return this.gameModules.player;
  }
  get weapon() {
    return this.gameModules.weapon;
  }
  get enemy() {
    return this.gameModules.enemy;
  }
  get hitspark() {
    return this.gameModules.hitspark;
  }
}