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
    this.state = 'dead'
    this.destination = { x: 0, y: 0, z: 0 };
    
    this.SPRITESHEET = {
      alive1: 0,
      alive2: 1,
      dead: 3,
    };

    this.BOUNDS = {
      posX: RIGHT_BOUND - 50,
      negX: LEFT_BOUND + 50,
      posY: -150,
      negY: -230,
      posZ: PLAYER_Z - 200,
      negZ: -400,
    }

    this.SPEED = 5;
  }
  spawn() {
    // get destination
    this.destination = this.randomPointinBounds();
    // spawning from front or back?
    const isFront = (getRndInteger(0, 1);
    this.setX(this.destination.x);
    this.setZ((isFront) ? this.parent.frames.startZ : this.camera.z + DEPTH);
    this.setY((isFront) ? this.calculatedY : this.destination.y);
    this.state = `spawning${(isFront) ? 'Front' : 'Back'}`;
  }
  randomPointinBounds() {
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
        this.decrementSleep()
        return false;
      case 'shoot3':
      case 'shoot2':
      case 'shoot1':
        if (!this.sleepTimer) {
          this.fire();
        }
        this.decrementSleep()
        return false;
      case 'reposition':
        this.goToDestination();
        return false;
      case 'dying':
        this.setZ(this.z + this.parent.player.speed)
        this.setY(this.y + 10);
        if (this.y < this.currentFrame.ground.y - 30) {
          this.setY(this.currentFrame.ground.y - 30);
          this.sprite.gameObject.setFrame(this.SPRITESHEET.dead);
          this.scene.sound.play('explode');
          return this.z > (this.camera.z + DEPTH);
        }
      case 'dead':
        this.setZ(this.z + this.parent.player.speed)
        this.setY(this.currentFrame.ground.y -30);
        return this.z > (this.camera.z + DEPTH);
      default:
        return true;
    }
  }
  goToDestination() {
    const destinationVec = getUnitVec({ x: this.x, y: this.y, z: this.z }, this.destination)
    if (destinationVec.distance < 6) {
      this.state = 'idle';
    }
    this.setX(this.x + (destinationVec.direction.x * this.SPEED));
    this.setY(this.y - (destinationVec.direction.y * this.SPEED));
    this.setZ(this.z + (destinationVec.direction.z * this.SPEED));
  }
  fire() {
    if (!['shoot3', 'shoot2', 'shoot1'].includes(this.state) || this.sleepTimer > 0) return;
    const target = this.player.coords;
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
        this.state = 'shoot3';
        this.sleepTimer = 10;
        return;
      } else {
        this.state = 'reposition';
        this.sleepTimer = 100;
        return;
      }
    }
    if (['shoot3', 'shoot2'].includes(this.state)) {
      this.state = (this.state === 'shoot3') ? 'shoot2' : 'shoot1';
      this.sleepTimer = 10;
      return;
    }
    if (this.state === 'shoot1') {
      this.state = 'idle';
      this.sleepTimer = 100;
      return;
    }
  }
}