import {curveFn, DEPTH, FRAME_PERIOD} from './constants';
import GameModule from './GameModule';

export default class Frames extends GameModule {
  constructor(gameModules) {
    super(gameModules);
    const ground = this.camera.createRect({x: 1, y: 1, z: DEPTH}, FRAME_PERIOD, 'strip', 0);
    ground.forEach((f, i) => {
      f.y = curveFn(i);
    });

    const ceiling = this.camera.createRect({x: 1, y: 1, z: DEPTH}, FRAME_PERIOD, 'strip', 0);
    ceiling.forEach((c, i) => {
      c.y = -300 + curveFn(i);
    })

    const walls = this.camera.createRect({x: 2, y: 1, z: DEPTH}, {x: 500, y: 0, z: FRAME_PERIOD}, 'vertstrip', 0);
    const lWalls = [];
    const rWalls = [];
    walls.forEach((w, i) => {
      w.y = -150 + curveFn(i);
      w.z += 1;
      if (w.x < 0) {
        lWalls.push(w);
      } else {
        rWalls.push(w);
      }
    })
    this._frames = [];
    for (let i = 0; i < DEPTH; i++) {
      const res = {
        ground: ground[i],
        ceiling: ceiling[i],
        lWall: lWalls[i],
        rWall: rWalls[i],
      };
      res.ground.gameObject.setFrame(i % 4);
      res.ceiling.gameObject.setFrame(i % 4);
      res.lWall.gameObject.setFrame(i % 4);
      res.rWall.gameObject.setFrame(i % 4);
      this._frames.push(res);
    }
    this.startZ = this.getFrame(0).ground.z;
    this.distanceTravelled = 0;
  }
  getFrame(index) {
    return this._frames[index];
  }
  get sorted() {
    const sorted = [...this._frames];
    sorted.sort((a, b) => b.ground.z - a.ground.z);
    return sorted;
  }
  findClosestFrame(z) {
    return this._frames.reduce((closest, current) => ((Math.abs(closest.ground.z - z) < Math.abs(current.ground.z - z)) ? closest : current));
  }
  update() {
    this._frames.forEach(({ ground, ceiling, lWall, rWall }) => {
      ground.z += this.player.speed;
      ceiling.z += this.player.speed;
      lWall.z += this.player.speed;
      rWall.z += this.player.speed;
      if (ground.z > (this.camera.z + DEPTH)) {
        ground.z = this.startZ;
        ceiling.z = this.startZ;
        lWall.z = this.startZ + 1;
        rWall.z = this.startZ + 1;
        // sort frames by z pos desc and assign y pos from curve
        this.sorted.forEach((frame, i) => {
          frame.ground.y = curveFn(i)
          frame.ceiling.y = -300 + curveFn(i);
          frame.lWall.y = -150 + curveFn(i);
          frame.rWall.y = -150 + curveFn(i);
        });
        this.distanceTravelled += 1;
      }
    });
  }
}