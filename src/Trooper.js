import EnemyBase from "./EnemyBase";
import {DEPTH, LEFT_BOUND, PLAYER_Z, RIGHT_BOUND} from "./constants";

export default class Trooper extends EnemyBase {
  constructor(id, sprite3d, parent) {
    super(`tr${id}`, sprite3d, parent, 'trooper');
    this.health = 6;
    this.torso = parent.camera.create(0, 0, 0, 'trooper', 0, false);

    this.sleepTimer = 100;
    // states: positioning, firing, running, dead
    this.state = 'dead';
    this.targetZ = -100
    this.BOUNDS = {
      posX: RIGHT_BOUND - 50,
      negX: LEFT_BOUND + 50,
      posZ: PLAYER_Z - 200,
      negZ: -100,
    }
    this.SPEED = 8;
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
        this.state = 'dead'
        this.scene.sound.play('explode', true);
        this.sprite.visible = false;
      }
    }
  }
  activate(value = true) {
    this.sleepTimer = 100;
    this.sprite.visible = value;
    this.torso.visible = value;
    if (value) {
      this.health = 8;
      this.sprite.gameObject.play('trooperrunningforward', true);
      this.torso.gameObject.setFrame(0);
    }
  }
  get calculatedY() {
    return this.currentFrame.ground.y - 30;
  }
  update() {
    if (!this.active) return true;
    this.setY(this.calculatedY);
    switch (this.state) {
      case 'positioning':
        if (this.z < this.targetZ) {
          this.state = 'firing'
        } else {
          this.setZ()
        }
      case 'firing':
        if (!this.sleepTimer) this.fire();
        this.decrementSleep();
      case 'dead':
        this.setZ(this.z + this.parent.player.speed)
        return this.z > (this.camera.z + DEPTH);
      default:
        return true;
    }
  }
}