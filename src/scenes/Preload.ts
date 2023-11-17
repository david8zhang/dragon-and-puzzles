export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('green-dragon-debug', 'dragons/flygon.png')
    this.load.image('fire-dragon-debug', 'dragons/charizard.png')
    this.load.image('water-dragon-debug', 'dragons/gyarados.png')
    this.load.image('light-dragon-debug', 'dragons/dragonite.png')
    this.load.image('dark-dragon-debug', 'dragons/hydreigon.png')
    this.load.image('rainbow-debug', 'dragons/reshiram.png')

    this.load.image('heart', 'ui/heart.png')
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('victory', 'ui/victory.jpeg')
    this.load.image('background', 'ui/bg.png')

    this.load.image('orb-none', 'orbs/orb-none.png')
    this.load.image('orb-fire', 'orbs/orb-fire.png')
    this.load.image('orb-water', 'orbs/orb-water.png')
    this.load.image('orb-grass', 'orbs/orb-grass.png')
    this.load.image('orb-light', 'orbs/orb-light.png')
    this.load.image('orb-dark', 'orbs/orb-dark.png')
    this.load.image('orb-health', 'orbs/orb-health.png')
  }

  create() {
    this.scene.start('start')
  }
}
