import {curveFn, DEPTH, FRAME_PERIOD} from './constants';

export default class Frames {
  constructor(camera) {
    const ground = camera.createRect({x: 1, y: 1, z: DEPTH}, FRAME_PERIOD, 'strip', 0);
    ground.forEach((f, i) => {
      f.y = curveFn(i);
    });

    const ceiling = camera.createRect({x: 1, y: 1, z: DEPTH}, FRAME_PERIOD, 'strip', 0);
    ceiling.forEach((c, i) => {
      c.y = -300 + curveFn(i);
    })

    const walls = camera.createRect({x: 2, y: 1, z: DEPTH}, {x: 500, y: 0, z: FRAME_PERIOD}, 'vertstrip', 0);
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
    this.frames = [];
    for (let i = 0; i < DEPTH; i++) {
      const res = {
        ground: ground[i],
        ceiling: ceiling[i],
        lWall: lWalls[i],
        rWall: rWalls[i],
      };
      if (i % 2 === 1) {
        res.ground.gameObject.setFrame(1);
        res.ceiling.gameObject.setFrame(1);
        res.lWall.gameObject.setFrame(1);
        res.rWall.gameObject.setFrame(1);
      }
      this.frames.push(res);
    }
    this.camera = camera;
    this.startZ = this.getFrame(0).ground.z;
    this.distanceTravelled = 0;
  }
  getFrame(index) {
    return this.frames[index];
  }
  get sorted() {
    const sorted = [...this.frames];
    sorted.sort((a, b) => b.ground.z - a.ground.z);
    return sorted;
  }
  findClosestFrame(z) {
    return this.frames.reduce((closest, current) => ((Math.abs(closest.ground.z - z) < Math.abs(current.ground.z - z)) ? closest : current));
  }
  update(speed) {
    this.frames.forEach(({ ground, ceiling, lWall, rWall }) => {
      ground.z += speed;
      ceiling.z += speed;
      lWall.z += speed;
      rWall.z += speed;
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