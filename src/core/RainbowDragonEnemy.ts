import { Constants, Elements } from '~/utils/Constants'
import { Enemy, EnemyConfig } from './Enemy'
import { Game } from '~/scenes/Game'

export class RainbowDragonEnemy extends Enemy {
  public static readonly CONFIG: EnemyConfig = {
    maxHealth: 150,
    spriteName: 'rainbow-dragon',
    element: Elements.ALL,
    baseDamage: 25,
    maxTurnsUntilAttack: 2,
  }
  private static readonly SCALES_SPRITE_NAME_1: string =
    'rainbow-dragon-scales-1'
  private static readonly SCALES_SPRITE_NAME_2: string =
    'rainbow-dragon-scales-2'
  private static readonly EYE_SPRITE_NAME: string = 'rainbow-dragon-eye'

  public scaleSprite1: Phaser.GameObjects.Sprite
  public scaleSprite2: Phaser.GameObjects.Sprite
  public eyeSprite: Phaser.GameObjects.Sprite

  constructor(game: Game, config: EnemyConfig) {
    super(game, config)
    this.scaleSprite1 = this.game.add
      .sprite(
        Enemy.POSITION.x,
        Enemy.POSITION.y,
        RainbowDragonEnemy.SCALES_SPRITE_NAME_1
      )
      .setScale(2)
    this.scaleSprite2 = this.game.add
      .sprite(
        Enemy.POSITION.x,
        Enemy.POSITION.y,
        RainbowDragonEnemy.SCALES_SPRITE_NAME_2
      )
      .setScale(2)
    this.eyeSprite = this.game.add
      .sprite(
        Enemy.POSITION.x,
        Enemy.POSITION.y,
        RainbowDragonEnemy.EYE_SPRITE_NAME
      )
      .setScale(2)

    // If this is the rainbow dragon, pick a random element and change the tint
    if (config.element === Elements.ALL) {
      this.morphToRandomElement()
    }

    this.addTurnEndListener(() => {
      this.morphToRandomElement()
    })
    this.setupScaleAndEyeAnimations()
    this.setupRainbowScales()
  }

  protected override setupAnimations(spriteName: string): void {
    const attackFrames = this.game.anims.generateFrameNumbers(spriteName, {
      start: 1,
      end: 5,
    })
    attackFrames[0].duration = 150
    attackFrames[1].duration = 150
    attackFrames[2].duration = 150
    attackFrames[3].duration = 500
    attackFrames[4].duration = 0

    this.sprite.anims.create({
      key: 'attack',
      frames: attackFrames,
    })
    this.sprite.on('animationupdate', () => {
      this.boingSprite()
    })
    this.sprite.on('animationstart', () => {
      this.scaleSprite1.play('attack')
      this.scaleSprite2.play('attack')
      this.eyeSprite.play('attack')
    })
  }
  protected override boingSprite() {
    this.game.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 200,
      ease: 'back.out',
      onUpdate: (tween) => {
        this.sprite.scaleX = 2 + tween.getValue() * 0.1
        this.sprite.scaleY = 2 - tween.getValue() * 0.1
        this.scaleSprite1.scaleX = 2 + tween.getValue() * 0.1
        this.scaleSprite1.scaleY = 2 - tween.getValue() * 0.1
        this.scaleSprite2.scaleX = 2 + tween.getValue() * 0.1
        this.scaleSprite2.scaleY = 2 - tween.getValue() * 0.1
        this.eyeSprite.scaleX = 2 - tween.getValue() * 0.1
        this.eyeSprite.scaleY = 2 - tween.getValue() * 0.1
      },
    })
  }

  setupScaleAndEyeAnimations() {
    const attackFramesScale1 = this.game.anims.generateFrameNumbers(
      RainbowDragonEnemy.SCALES_SPRITE_NAME_1,
      {
        start: 1,
        end: 5,
      }
    )
    attackFramesScale1[0].duration = 150
    attackFramesScale1[1].duration = 150
    attackFramesScale1[2].duration = 150
    attackFramesScale1[3].duration = 500
    attackFramesScale1[4].duration = 0
    this.scaleSprite1.anims.create({
      key: 'attack',
      frames: attackFramesScale1,
    })
    const attackFramesScale2 = this.game.anims.generateFrameNumbers(
      RainbowDragonEnemy.SCALES_SPRITE_NAME_2,
      {
        start: 1,
        end: 5,
      }
    )
    attackFramesScale2[0].duration = 150
    attackFramesScale2[1].duration = 150
    attackFramesScale2[2].duration = 150
    attackFramesScale2[3].duration = 500
    attackFramesScale2[4].duration = 0
    this.scaleSprite2.anims.create({
      key: 'attack',
      frames: attackFramesScale2,
    })

    const attackFramesEye = this.game.anims.generateFrameNumbers(
      RainbowDragonEnemy.EYE_SPRITE_NAME,
      {
        start: 1,
        end: 5,
      }
    )
    attackFramesEye[0].duration = 150
    attackFramesEye[1].duration = 150
    attackFramesEye[2].duration = 150
    attackFramesEye[3].duration = 500
    attackFramesEye[4].duration = 0
    this.eyeSprite.anims.create({
      key: 'attack',
      frames: attackFramesEye,
    })
  }

  setupRainbowScales() {
    this.game.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 6000,
      repeat: -1,
      onUpdate: (tween) => {
        this.scaleSprite1.setTint(
          Phaser.Display.Color.HSLToColor(tween.getValue() / 100, 1, 0.75).color
        )
      },
    })
  }

  morphToRandomElement() {
    const eligibleElements = [
      Elements.FIRE,
      Elements.WATER,
      Elements.DARK,
      Elements.LIGHT,
      Elements.GRASS,
    ]

    const currColor = Constants.ELEMENT_TO_COLOR[this.element]
    const randomElement = Phaser.Utils.Array.GetRandom(eligibleElements)
    const newColor = Constants.ELEMENT_TO_COLOR[randomElement]

    const oldColorObj = Phaser.Display.Color.ValueToColor(
      Number.parseInt(`0x${currColor}`, 16)
    )
    const newColorObj = Phaser.Display.Color.ValueToColor(
      Number.parseInt(`0x${newColor}`, 16)
    )

    this.game.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 500,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue()
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          oldColorObj,
          newColorObj,
          100,
          value
        )
        this.scaleSprite2.setTint(
          Phaser.Display.Color.GetColor(
            colorObject.r,
            colorObject.g,
            colorObject.b
          )
        )
        this.eyeSprite.setTint(
          Phaser.Display.Color.GetColor(
            colorObject.r,
            colorObject.g,
            colorObject.b
          )
        )
      },
      onComplete: () => {
        this.element = randomElement
      },
    })
  }

  protected override endTurn() {
    this.sprite.setFrame(0)
    this.scaleSprite1.setFrame(0)
    this.scaleSprite2.setFrame(0)
    this.eyeSprite.setFrame(0)
    this.game.time.delayedCall(500, () => {
      this.nextMoveText.text = `Attacks in ${this.turnsUntilAttack} turn${
        this.turnsUntilAttack == 1 ? '' : 's'
      }`
      this.turnEndListener.forEach((fn) => fn())
    })
  }
}
