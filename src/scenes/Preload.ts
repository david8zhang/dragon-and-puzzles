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

    this.load.image('orb-water-disabled', 'orbs/orb-water-disabled.png')
    this.load.image('orb-grass-disabled', 'orbs/orb-grass-disabled.png')
    this.load.image('orb-light-disabled', 'orbs/orb-light-disabled.png')
    this.load.image('orb-dark-disabled', 'orbs/orb-dark-disabled.png')

    this.load.spritesheet(
      'grass-attack-charge',
      'vfx/grass-attack-charge.png',
      {
        frameWidth: 128,
        frameHeight: 64,
      }
    )
    this.load.spritesheet('grass-attack', 'vfx/grass-attack.png', {
      frameWidth: 128,
      frameHeight: 64,
    })
    this.load.spritesheet(
      'grass-attack-impact',
      'vfx/grass-attack-impact.png',
      {
        frameWidth: 196,
        frameHeight: 64,
      }
    )
    this.load.spritesheet('fire-attack-charge', 'vfx/fire-attack-charge.png', {
      frameWidth: 128,
      frameHeight: 64,
    })
    this.load.spritesheet('fire-attack', 'vfx/fire-attack.png', {
      frameWidth: 128,
      frameHeight: 64,
    })
    this.load.spritesheet('fire-attack-impact', 'vfx/fire-attack-impact.png', {
      frameWidth: 196,
      frameHeight: 64,
    })

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
    this.scene.start('game')
  }
}
