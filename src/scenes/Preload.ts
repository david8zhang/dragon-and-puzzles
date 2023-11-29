export class Preload extends Phaser.Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('tutorial-debug', 'dragons/axew.png')
    this.load.spritesheet('green-dragon', 'dragons/grass-dragon.png', {
      frameWidth: 128,
      frameHeight: 128,
    })
    this.load.spritesheet('fire-dragon', 'dragons/fire-dragon.png', {
      frameWidth: 128,
      frameHeight: 128,
    })
    this.load.spritesheet('water-dragon', 'dragons/water-dragon.png', {
      frameWidth: 128,
      frameHeight: 128,
    })
    this.load.spritesheet('light-dragon', 'dragons/light-dragon.png', {
      frameWidth: 128,
      frameHeight: 128,
    })
    this.load.spritesheet('dark-dragon', 'dragons/dark-dragon.png', {
      frameWidth: 128,
      frameHeight: 128,
    })
    this.load.spritesheet('rainbow-dragon', 'dragons/rainbow-dragon-body.png', {
      frameWidth: 192,
      frameHeight: 192,
    })
    this.load.spritesheet(
      'rainbow-dragon-scales-1',
      'dragons/rainbow-dragon-scales1.png',
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    )
    this.load.spritesheet(
      'rainbow-dragon-scales-2',
      'dragons/rainbow-dragon-scales2.png',
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    )
    this.load.spritesheet(
      'rainbow-dragon-eye',
      'dragons/rainbow-dragon-eye.png',
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    )

    this.load.image('heart', 'ui/heart.png')
    this.load.image('background', 'ui/bg.png')
    this.load.image('pointer', 'ui/pointer.png')

    this.load.image('orb-none', 'orbs/orb-none.png')
    this.load.image('orb-fire', 'orbs/orb-fire.png')
    this.load.image('orb-water', 'orbs/orb-water.png')
    this.load.image('orb-grass', 'orbs/orb-grass.png')
    this.load.image('orb-light', 'orbs/orb-light.png')
    this.load.image('orb-dark', 'orbs/orb-dark.png')
    this.load.image('orb-health', 'orbs/orb-health.png')

    this.load.image('orb-water-disabled', 'orbs/orb-water-disabled.png')
    this.load.image('orb-grass-disabled', 'orbs/orb-grass-disabled.png')
    this.load.image('orb-light-disabled', 'orbs/orb-light-disabled.png')
    this.load.image('orb-dark-disabled', 'orbs/orb-dark-disabled.png')

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

    // Cutscene
    this.load.image('intro-1', 'cutscene/intro-1.png')
    this.load.image('intro-2', 'cutscene/intro-2.png')
    this.load.image('intro-3', 'cutscene/intro-3.png')
    this.load.image('intro-4', 'cutscene/intro-4.jpg')
    this.load.image('boss-1', 'cutscene/boss-1.png')
    this.load.image('boss-2', 'cutscene/boss-2.png')
    this.load.image('victory', 'cutscene/victory.png')
    this.load.image('game-over', 'cutscene/game-over.png')
  }

  create() {
    this.scene.start('start')
  }
}
