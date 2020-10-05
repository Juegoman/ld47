import EnemyBase from './EnemyBase';
import {DEPTH, LEFT_BOUND, PLAYER_Z, RIGHT_BOUND} from './constants';
import getRndInteger from './getRndInteger';
import getUnitVec from "./getUnitVec";

export default class Drone extends EnemyBase {
  constructor(id, sprite3d, parent) {
    super(`d${id}`, sprite3d, parent, 'drone');
    this.health = 10;

    this.sleepTimer = 100;
    // states: spawningFront, spawningBack, idle, shoot3, shoot2, shoot1, reposition, dying, dead
    this.state = 'dead';
    this.destination = null;
    
    this.SPRITESHEET = {
      alive1: 0,
      alive2: 1,
      dead: 2,
    };

    this.BOUNDS = {
      posX: RIGHT_BOUND - 50,
      negX: LEFT_BOUND + 50,
      posY: -190,
      negY: -270,
      posZ: PLAYER_Z - 200,
      negZ: -100,
    }

    this.SPEED = 5;
  }
  get alive() {
    return this.health > 0;
  }
  get active() {
    return this.sprite.visible && this.player.alive;
  }
  hit() {
    if (this.alive) {
      this.health -= (this.health) ? 1 : 0;
      if (this.health === 0) {
        this.state = 'dying'
        this.player.addScore(500);
      }
      this.scene.sound.play('hit', { volume: 0.5 });
    }
  }
  spawn() {
    // get destination
    this.destination = this.randomPointInBounds();
    // spawning from front or back?
    const isFront = getRndInteger(0, 1);
    this.setX(this.destination.x);
    this.setZ((isFront) ? this.parent.frames.startZ : this.camera.z + DEPTH);
    this.setY((isFront) ? this.calculatedY : this.destination.y);
    this.state = `spawning${(isFront) ? 'Front' : 'Back'}`;
    this.activate();
    return this;
  }
  activate(value = true) {
    this.sleepTimer = 100;
    this.sprite.visible = value;
    if (value) {
      this.health = (this.player.hyperMode) ? 20 : 10;
      this.sprite.gameObject.play('drone', true);
    }
  }
  randomPointInBounds() {
    return {
      x: getRndInteger(this.BOUNDS.negX, this.BOUNDS.posX),
      y: getRndInteger(this.BOUNDS.negY, this.BOUNDS.posY),
      z: getRndInteger(this.BOUNDS.negZ, this.BOUNDS.posZ),
    };
  }
  get calculatedY() {
    return this.currentFrame.lWall.y;
  }
  update() {
    if (!this.active) return true;
    switch (this.state) {
      case 'spawningFront':
        if (this.z > this.BOUNDS.negZ) {
          this.goToDestination();
        } else {
          this.setZ(this.z + this.parent.player.speed);
          this.setY(this.calculatedY);
        }
        return false;
      case 'spawningBack':
        if (this.z < this.BOUNDS.posZ) {
          this.goToDestination();
        } else {
          this.setZ(this.z + (-10 + this.parent.player.speed))
        }
        return false;
      case 'idle':
        this.decrementSleep();
        return false;
      case 'shoot6':
      case 'shoot5':
      case 'shoot4':
      case 'shoot3':
      case 'shoot2':
      case 'shoot1':
        if (!this.sleepTimer) {
          this.fire();
        }
        this.decrementSleep();
        return false;
      case 'reposition':
        this.goToDestination();
        return false;
      case 'dying':
        this.setY(this.currentFrame.ground.y - 30);
        this.sprite.gameObject.play('dronedead', true);
        this.scene.sound.play('explode');
        this.state = 'dead';
        return this.z > (this.camera.z + DEPTH);
      case 'dead':
        this.setZ(this.z + this.parent.player.speed)
        this.setY(this.currentFrame.ground.y - 30);
        return this.z > (this.camera.z + DEPTH);
      default:
        return true;
    }
  }
  goToDestination() {
    if (this.destination === null)  this.destination = this.randomPointInBounds();
    const destinationVec = getUnitVec({ x: this.x, y: this.y, z: this.z }, this.destination)
    this.setX(this.x + (destinationVec.direction.x * this.SPEED));
    this.setY(this.y - (destinationVec.direction.y * this.SPEED));
    this.setZ(this.z + (destinationVec.direction.z * this.SPEED));
    if (destinationVec.distance < 7) {
      this.state = 'idle';
      this.destination = null;
    }
  }
  fire() {
    if (!this.state.includes('shoot') || this.sleepTimer > 0) return;
    const target = {
      x: this.player.x + getRndInteger(-10, 10),
      y: this.player.y + getRndInteger(-10, 10),
      z: this.player.z + getRndInteger(-10, 10),
    };
    const origin = this.coords;
    if (origin.z - target.z < 0) {
      const bullet = this.bullets.pop();
      bullet.fire(getUnitVec(origin, target));
      this.activeBullets.push(bullet);
      this.scene.sound.play('bang');
    }
  }
  decrementSleep() {
    if (this.sleepTimer) {
      this.sleepTimer -= 1;
      return;
    }
    if (this.state === 'idle') {
      if (getRndInteger(0, 1)) {
        this.state = (this.player.hyperMode) ? 'shoot6' : 'shoot3';
        this.sleepTimer = 10;
        return;
      } else {
        this.state = 'reposition';
        this.sleepTimer = 100;
        return;
      }
    }
    if (this.state.includes('shoot')) {
      const iter = Number(this.state.split('shoot')[1]);
      const nextState = `shoot${iter - 1}`;
      if (nextState === 'shoot0') {
        this.state = 'idle';
        this.sleepTimer = 100;
        return;
      }
      this.state = nextState;
      this.sleepTimer = 10;
    }
  }
}