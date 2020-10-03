import Phaser from 'phaser';
import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import guy from './assets/guy.png';

let config = {
  type: Phaser.CANVAS,
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
let character;
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

const RIGHT_BOUND = 190;
const LEFT_BOUND = -1 * RIGHT_BOUND;
const DEPTH = 80;
const FRAME_PERIOD = 20;

let game = new Phaser.Game(config);

const CURVE = [...Array(DEPTH).keys()].map(n => Math.sqrt(DEPTH**2 - n**2));
const curveFn = (i) => (-DEPTH + CURVE[i]) * 10;

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
}

function create () {
  camera = this.cameras3d.addPerspectiveCamera(80)
      .setPosition(0, -100, 730)
      .setPixelScale(48);
  frames = buildFrames(camera);
  startZ = frames[0].floor.z;

  character = camera.create(0, -48, 600, 'character', 0);
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('character', { frames: [0, 1, 0, 2] }),
    frameRate: 3,
    repeat: -1,
  })
  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('character', { frames: [0, 1, 0, 2] }),
    frameRate: 6,
    repeat: -1,
  })
  character.gameObject.play('walk');
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
      lWall.z = startZ;
      rWall.z = startZ;
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

  character.x = camera.x;

  speed = 3;
  if (cursors.up.isDown) {
    speed = 5;
    character.gameObject.play('run', true);
  } else {
    character.gameObject.play('walk', true);
    if (cursors.down.isDown) {
      speed = 1;
    }
  }
  camera.update();
  text.setText([
    'camera.x: ' + camera.x,
    'camera.y: ' + camera.y,
    'camera.z: ' + camera.z,
    'dash.dir: ' + dash.dir,
    'dash.wait: ' + dash.wait,
  ]);
}
