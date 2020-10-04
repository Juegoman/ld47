import Phaser from 'phaser';

import { RIGHT_BOUND, LEFT_BOUND, DEPTH, FRAME_PERIOD, CURVE, curveFn } from "./constants";
import getClickedPoint from "./getClickedPoint";

import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import guy from './assets/guy.png';
import pointImage from './assets/point.png';

import Vector4 from 'phaser/src/math/Vector4';


let config = {
  type: Phaser.WEBGL,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  backgroundColor: '#989898',
  antialias: false,
  scene: {
    preload,
    create,
    update,
  }
};

let camera;
let cursors;
let frames;
let characterLegs;
let characterTorso;
let point = undefined;
let speed = 3;
let startZ;
let text;
let comboAA;
let comboDD;
let dash = {
  wait: 0,
  dir: null,
  step: null,
}


let game = new Phaser.Game(config);
// const highPrecCurveFn = n => (-DEPTH + Math.sqrt((DEPTH)**2 - n**2)) * 10;

function buildFrames(camera) {
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

function preload () {
  this.load.spritesheet('strip', checkerboard, { frameWidth: 160, frameHeight: 50 });
  this.load.spritesheet('vertstrip', verticalCheckerboard, { frameWidth: 64, frameHeight: 160 })
  this.load.spritesheet('character', guy, { frameHeight: 56, frameWidth: 32 });
  this.load.image('point', pointImage);
}

function create () {
  camera = this.cameras3d.addPerspectiveCamera(80)
      .setPosition(0, -100, 730)
      .setPixelScale(48);
  frames = buildFrames(camera);
  startZ = frames[0].floor.z;

  characterLegs = camera.create(0, -48, 600, 'character', 0);
  characterTorso = camera.create(0, -48, 600, 'character', 4);

  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
    frameRate: 3,
    repeat: -1,
  })
  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('character', { frames: [1, 3, 2, 3] }),
    frameRate: 6,
    repeat: -1,
  })
  characterLegs.gameObject.play('walk');
  cursors = this.input.keyboard.addKeys({
    'up': Phaser.Input.Keyboard.KeyCodes.W,
    'down': Phaser.Input.Keyboard.KeyCodes.S,
    'left': Phaser.Input.Keyboard.KeyCodes.A,
    'right': Phaser.Input.Keyboard.KeyCodes.D
  });

  comboAA = this.input.keyboard.createCombo('AA', { resetOnMatch: true, maxKeyDelay: 300 });
  comboDD = this.input.keyboard.createCombo('DD', { resetOnMatch: true, maxKeyDelay: 300 });
  this.input.keyboard.on('keycombomatch', function (event) {
    console.log('Key Combo matched!' + event.keyCodes.join(', '));
    const code = event.keyCodes.join('');
    if (code === '6565' && dash.wait === 0) {
      dash.wait = 100;
      dash.dir = 'left';
    } else if (code === '6868' && dash.wait === 0) {
      dash.wait = 100;
      dash.dir = 'right';
    }
  });
  this.input.on('pointerdown', (event) => {
    console.log(event.x, event.y);
    let target = getClickedPoint(event.x, event.y, camera, frames);
    console.log(target);

    const origin = {x: camera.x, y: -60, z: 600};
    const unSimple = { x: target.x - origin.x, y: target.y - origin.y, z: target.z - origin.z }
    const distance = Math.sqrt(unSimple.x**2 + unSimple.y**2 + unSimple.z**2);
    const direction = { x: unSimple.x / distance, y: -unSimple.y / distance, z: unSimple.z / distance };

    let ray = {
      origin,
      direction
    }
    console.log(ray);

    if (point !== undefined) {
        point.x = ray.origin.x;
        point.y = ray.origin.y;
        point.z = ray.origin.z;
    } else {
        point = camera.create(ray.origin.x, ray.origin.y, ray.origin.z, 'point', 0);
    }
    point.originalRay = ray;
  });

  text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
}

function update () {
  //  Scroll the frames
  frames.forEach(({ floor, ceiling, lWall, rWall }) => {
    floor.z += speed;
    ceiling.z += speed;
    lWall.z += speed;
    rWall.z += speed;
    if (floor.z > (camera.z + DEPTH)) {
      floor.z = startZ;
      ceiling.z = startZ;
      lWall.z = startZ + 1;
      rWall.z = startZ + 1;
      // sort frames by z pos desc and assign y pos from curve
      const sorted = [...frames].sort((a, b) => b.floor.z - a.floor.z);
      sorted.forEach((frame, i) => {
        frame.floor.y = curveFn(i)
        frame.ceiling.y = -300 + curveFn(i);
        frame.lWall.y = -150 + curveFn(i);
        frame.rWall.y = -150 + curveFn(i);
      });
    }
  });
  if (cursors.left.isDown) {
      camera.x -= 4;
  } else if (cursors.right.isDown) {
      camera.x += 4;
  }
  if (dash.dir !== null) {
    if (dash.dir === 'left') {
      camera.x -= 15;
    } else if (dash.dir === 'right') {
      camera.x += 15
    }
    if (dash.step === null || dash.step < 4) {
      dash.step = (dash.step === null) ? 1 : dash.step + 1;
    } else {
      dash.step = null;
      dash.dir = null;
    }
  }
  if (camera.x <= LEFT_BOUND) camera.x = LEFT_BOUND;
  if (camera.x >= RIGHT_BOUND) camera.x = RIGHT_BOUND;
  dash.wait = (dash.wait === 0) ? 0 : dash.wait - 1;

  characterLegs.x = camera.x;
  characterTorso.x = camera.x;

  speed = 3;
  if (cursors.up.isDown) {
    speed = 5;
    characterLegs.gameObject.play('run', true);
  } else {
    characterLegs.gameObject.play('walk', true);
    if (cursors.down.isDown) {
      speed = 1;
    }
  }
  if (point !== undefined) {
    point.x = point.x + (point.originalRay.direction.x * 10);
    point.y = point.y - (point.originalRay.direction.y * 10);
    point.z = point.z + (point.originalRay.direction.z * 10);
  }
  const origRay = (point && point.originalRay) ? point.originalRay : {
    direction: { x: 'n/a', y: 'n/a', z: 'n/a' },
  };
  const pt = (point) ? point : { x: 'n/a', y: 'n/a', z: 'n/a' };
  camera.update();
  text.setText([
    'camera.x: ' + camera.x,
    'camera.y: ' + camera.y,
    'camera.z: ' + camera.z,
    'dash.dir: ' + dash.dir,
    'dash.wait: ' + dash.wait,
    'point.originalRay.direction.x: ' + origRay.direction.x,
    'point.originalRay.direction.y: ' + origRay.direction.y,
    'point.originalRay.direction.z: ' + origRay.direction.z,
    'point.x: ' + pt.x,
    'point.y: ' + pt.y,
    'point.z: ' + pt.z,
  ]);
}
