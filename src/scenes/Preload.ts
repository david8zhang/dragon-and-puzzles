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
    this.load.image('tutorial-debug', 'dragons/axew.png')

    this.load.image('heart', 'ui/heart.png')
    this.load.image('gameover', 'ui/gameover.png')
    this.load.image('victory', 'ui/victory.jpeg')
    this.load.image('background', 'ui/bg.png')
    this.load.image('pointer', 'ui/pointer.png')

    this.load.image('orb-none', 'orbs/orb-none.png')
    this.load.image('orb-fire', 'orbs/orb-fire.png')
    this.load.image('orb-water', 'orbs/orb-water.png')
    this.load.image('orb-grass', 'orbs/orb-grass.png')
    this.load.image('orb-light', 'orbs/orb-light.png')
    this.load.image('orb-dark', 'orbs/orb-dark.png')
    this.load.image('orb-health', 'orbs/orb-health.png')

    // BGM
    this.load.audio('start', 'audio/bgm/start.mp3')
    this.load.audio('tutorial', 'audio/bgm/tutorial.mp3')
    this.load.audio('level', 'audio/bgm/level.mp3')
    this.load.audio('level-2', 'audio/bgm/level-2.mp3')
    this.load.audio('level-victory', 'audio/bgm/level-victory.mp3')
    this.load.audio('game-victory', 'audio/bgm/game-victory.mp3')
    this.load.audio('defeat', 'audio/bgm/defeat.mp3')
    this.load.audio('final-boss-1', 'audio/bgm/final-boss-1.mp3')
    this.load.audio('final-boss-2', 'audio/bgm/final-boss-2.mp3')
    this.load.audio('intro-cutscene', 'audio/bgm/intro-cutscene.mp3')

    // SFX
    this.load.audio('orb-move', 'audio/sfx/orb-move.mp3')
    this.load.audio('combo', 'audio/sfx/combo.wav')
    this.load.audio('basic-attack', 'audio/sfx/basic-attack.mp3')
    this.load.audio('weak-attack', 'audio/sfx/weak-attack.wav')
    this.load.audio('effective-attack', 'audio/sfx/effective-attack.wav')
    this.load.audio('heal', 'audio/sfx/heal.wav')
  }

  create() {
    this.scene.start('start')
  }
}
