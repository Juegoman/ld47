import Phaser from 'phaser';

import { RIGHT_BOUND, LEFT_BOUND, DEPTH, FRAME_PERIOD, curveFn } from './constants';
import getClickedPoint from './getClickedPoint';
import buildFrames from './buildFrames';

import checkerboard from './assets/checkerboard.png';
import verticalCheckerboard from './assets/vertcheckerboard.png';
import guy from './assets/guy.png';
import pointImage from './assets/point.png';

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
let weapon;
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

function findClosestFrame(z) {
  return frames.reduce((closest, current) => ((Math.abs(closest.floor.z - z) < Math.abs(current.floor.z - z)) ? closest : current));
}

let game = new Phaser.Game(config);

function preload () {
  this.load.spritesheet('strip', checkerboard, { frameWidth: 160, frameHeight: 50 });
  this.load.spritesheet('vertstrip', verticalCheckerboard, { frameWidth: 64, frameHeight: 160 })
  this.load.spritesheet('character', guy, { frameHeight: 56, frameWidth: 32 });
  this.load.image('point', pointImage);
}

function create () {
  camera = this.cameras3d.addPerspectiveCamera(80)
      .setPosition(0, -100, 720)
      .setPixelScale(48);
  frames = buildFrames(camera);
  startZ = frames[0].floor.z;

  characterLegs = camera.create(0, -48, 600, 'character', 0);
  characterTorso = camera.create(0, -48, 600, 'character', 4);

  weapon = {
    fire(x, y) {
      if (this.wait > 0) { return; }

      let target = getClickedPoint(x, y, camera, frames);

      const origin = {x: camera.x, y: -60, z: 600};
      const unSimple = { x: target.x - origin.x, y: target.y - origin.y, z: target.z - origin.z }
      const distance = Math.sqrt(unSimple.x**2 + unSimple.y**2 + unSimple.z**2);
      // invert y because we live in clown world
      const direction = { x: unSimple.x / distance, y: -unSimple.y / distance, z: unSimple.z / distance };
      let ray = {
        origin,
        direction,
        target,
      }

      const bullet = this.bullets.pop();
      bullet.visible = true;
      bullet.x = ray.origin.x;
      bullet.y = ray.origin.y;
      bullet.z = ray.origin.z;
      bullet.originalRay = ray;
      this.activeBullets.push(bullet);
      this.wait = 15;
    },
    update() {
      const cleanup = [];
      this.activeBullets.forEach((b) => {
        b.x = b.x + (b.originalRay.direction.x * 10);
        b.y = b.y - (b.originalRay.direction.y * 10);
        b.z = b.z + (b.originalRay.direction.z * 10);
        if (this.boundsCheck(b)) {
          this.hitspark(b);
          b.x = 0;
          b.y = 0;
          b.z = 0;
          b.visible = false;
          cleanup.push(b.id);
        }
      });
      cleanup.forEach(id => {
        const index = this.activeBullets.findIndex(b => b.id === id);
        this.bullets.push(...this.activeBullets.splice(index, 1));
      });
      this.wait -= (this.wait > 0) ? 1 : 0;
    },
    boundsCheck(bullet) {
      const frame = findClosestFrame(bullet.z);
      return bullet.x < LEFT_BOUND - 10 ||
          bullet.x > RIGHT_BOUND + 10 ||
          bullet.y < frame.ceiling.y + 25 ||
          bullet.y > frame.floor.y - 25;
    },
    hitspark(bullet) {
      // todo
    },
    activeBullets: [],
    bullets: camera.createMultiple(30, 'point', 0, false).map((b, i) => {
      b.id = i;
      return b;
    }),
    wait: 0,
    BULLET_SPEED: 18,
  };

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
  if (this.input.mousePointer.primaryDown) {
    weapon.fire(this.input.mousePointer.x, this.input.mousePointer.y);
  }
  weapon.update();
  camera.update();
  text.setText([
    'camera.x: ' + camera.x,
    'dash.wait: ' + dash.wait,
    'weapon.wait: ' + weapon.wait,
    'weapon.activeBullets.length: ' + weapon.activeBullets.length,
    'weapon.bullets.length: ' + weapon.bullets.length,
  ]);
}
