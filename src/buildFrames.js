import {curveFn, DEPTH, FRAME_PERIOD} from './constants';

export default function (camera) {
    const floor = camera.createRect({ x: 1, y: 1, z: DEPTH }, FRAME_PERIOD, 'strip', 0);
    floor.forEach((f, i) => {
        f.y = curveFn(i);
    });

    const ceiling = camera.createRect({ x: 1, y: 1, z: DEPTH }, FRAME_PERIOD, 'strip', 0);
    ceiling.forEach((c, i) => {
        c.y = -300 + curveFn(i);
    })

    const walls = camera.createRect({ x: 2, y: 1, z: DEPTH }, { x: 500, y: 0, z: FRAME_PERIOD }, 'vertstrip', 0);
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
    const result = [];
    for (let i = 0; i < DEPTH; i++) {
        const res = {
            floor: floor[i],
            ceiling: ceiling[i],
            lWall: lWalls[i],
            rWall: rWalls[i],
        };
        if (i % 2 === 1) {
            res.floor.gameObject.setFrame(1);
            res.ceiling.gameObject.setFrame(1);
            res.lWall.gameObject.setFrame(1);
            res.rWall.gameObject.setFrame(1);
        }
        result.push(res);
    }
    return result;
}