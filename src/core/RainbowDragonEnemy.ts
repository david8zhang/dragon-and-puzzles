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
    this.startAnimatingScales()
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
  }

  startAnimatingScales() {
    this.game.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 2000,
      repeat: -1,
      onUpdate: (tween) => {
        this.scaleSprite1.setTint(
          Phaser.Display.Color.HSLToColor(tween.getValue() / 100, 1, 0.75).color
        )
      },
    })

    this.game.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 3000,
      repeat: -1,
      onUpdate: (tween) => {
        this.scaleSprite2.setTint(
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
        this.sprite.setTint(
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
}
