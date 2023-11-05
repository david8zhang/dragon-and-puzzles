export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  create() {
    this.scene.start('game')
  }
}
