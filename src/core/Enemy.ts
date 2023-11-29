import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Constants, Elements } from '~/utils/Constants'
import { UINumber } from './UINumber'
import { AnimatedSprite } from './AnimatedSprite'
import { Player } from './Player'

export interface EnemyConfig {
  maxHealth: number
  spriteName: string
  element: Elements
  baseDamage: number
  maxTurnsUntilAttack: number
  chargeAnimationOffset: {
    x: number
    y: number
  }
  attackAnimationOffset: {
    x: number
    y: number
  }
}

export const ENEMIES: EnemyConfig[] = [
  {
    maxHealth: 75,
    spriteName: 'green-dragon',
    element: Elements.GRASS,
    baseDamage: 10,
    maxTurnsUntilAttack: 4,
    chargeAnimationOffset: {
      x: -20,
      y: -55,
    },
    attackAnimationOffset: {
      x: -120,
      y: 0,
    },
  },
  {
    maxHealth: 100,
    spriteName: 'water-dragon',
    element: Elements.WATER,
    baseDamage: 15,
    maxTurnsUntilAttack: 3,
    chargeAnimationOffset: {
      x: -20,
      y: -20,
    },
    attackAnimationOffset: {
      x: -120,
      y: -15,
    },
  },
  {
    maxHealth: 125,
    spriteName: 'light-dragon',
    element: Elements.LIGHT,
    baseDamage: 20,
    maxTurnsUntilAttack: 3,
    chargeAnimationOffset: {
      x: -20,
      y: 20,
    },
    attackAnimationOffset: {
      x: -120,
      y: 50,
    },
  },
  {
    maxHealth: 150,
    spriteName: 'dark-dragon',
    element: Elements.DARK,
    baseDamage: 20,
    maxTurnsUntilAttack: 3,
    chargeAnimationOffset: {
      x: -30,
      y: 30,
    },
    attackAnimationOffset: {
      x: -90,
      y: 30,
    },
  },
]

export class Enemy {
  public static readonly POSITION: { x: number; y: number } = {
    x: Constants.WINDOW_WIDTH - 150,
    y: 200,
  }

  public readonly maxHealth: number
  public health: number
  public healthBar!: Healthbar
  public sprite!: AnimatedSprite
  public element!: Elements

  protected game: Game
  protected turnsUntilAttack: number = 1
  protected maxTurnsUntilAttack: number = 3
  protected baseDamage: number = 0
  protected nextMoveText: Phaser.GameObjects.Text
  protected attackListener: Array<(damage: number) => void> = []
  protected turnEndListener: Array<() => void> = []
  public onDiedListener: Array<() => void> = []

  protected chargeAnimationOffset: {
    x: number
    y: number
  }
  protected attackAnimationOffset: {
    x: number
    y: number
  }

  constructor(game: Game, config: EnemyConfig) {
    this.game = game

    // Set up health
    this.maxHealth = config.maxHealth
    this.health = this.maxHealth
    this.baseDamage = config.baseDamage
    this.maxTurnsUntilAttack = config.maxTurnsUntilAttack
    this.setupHealthbar()

    this.chargeAnimationOffset = config.chargeAnimationOffset
    this.attackAnimationOffset = config.attackAnimationOffset
    this.sprite = this.setupSprite(config)

    // Set up next move text
    // TODO: Refactor this into its own fn?
    this.nextMoveText = this.game.add
      .text(
        Enemy.POSITION.x,
        Enemy.POSITION.y + 100,
        `Attacks in ${this.turnsUntilAttack} turn${
          this.turnsUntilAttack == 1 ? '' : 's'
        }`
      )
      .setStyle({
        fontSize: '20px',
      })
      .setStroke('#000000', 5)
      .setDepth(Constants.SORT_ORDER.ui)
    // Center align text
    this.nextMoveText.setPosition(
      this.nextMoveText.x - this.nextMoveText.displayWidth / 2,
      this.nextMoveText.y
    )
    this.animateNextMoveText()

    // If this is the rainbow dragon, pick a random element and change the tint
    if (config.element !== Elements.ALL) {
      this.element = config.element
    }
  }

  protected setupSprite(config: EnemyConfig): AnimatedSprite {
    return new AnimatedSprite(this.game, {
      spriteNames: [config.spriteName],
      position: {
        x: Enemy.POSITION.x,
        y: Enemy.POSITION.y,
      },
      startFrame: 1,
      endFrame: 2,
      frameRate: 2.5,
      isCharacter: true,
    })
  }

  animateNextMoveText() {
    this.game.tweens.addCounter({
      from: 255,
      to: 0,
      duration: 1000,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween) => {
        const color = Phaser.Display.Color.Interpolate.RGBWithRGB(
          // Tween from: #FF6464
          255,
          100,
          100,
          // Tween to: #FFFFFF
          255,
          255,
          255,
          // Tween params
          255, // length
          tween.getValue() // index
        )
        this.nextMoveText.setColor(
          Phaser.Display.Color.RGBToString(color.r, color.g, color.b, color.a)
        )
      },
    })
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
        position: {
          x: Enemy.POSITION.x - 100,
          y: Enemy.POSITION.y - 150,
        },
        length: 200,
        width: 15,
      },
      this
    )
  }

  damage(amount: number, element: Elements): void {
    const hasElementAdv =
      Constants.WEAKNESS_MAP[this.game.enemy.element].includes(element)
    const hasElementDisadv =
      Constants.RESISTANCES_MAP[this.game.enemy.element].includes(element)
    if (hasElementAdv) {
      this.game.sound.play('effective-attack')
      this.game.cameras.main.shake(250, 0.005)
    } else if (hasElementDisadv) {
      this.game.sound.play('weak-attack')
    } else {
      this.game.sound.play('basic-attack')
    }

    UINumber.createNumber(
      `${amount}`,
      this.game,
      Enemy.POSITION.x,
      Enemy.POSITION.y,
      `#${Constants.ELEMENT_TO_COLOR[element]}`,
      hasElementAdv ? '30px' : hasElementDisadv ? '20px' : '25px'
    )
    this.sprite.flash()
    this.game.battleUI.shakeBackground(false)
    this.health = Math.max(0, this.health - amount)
    this.healthBar.draw()
  }

  handleDeath() {
    this.nextMoveText.setVisible(false)
    this.sprite.fade(() => {
      this.game.time.delayedCall(500, () => {
        this.onDiedListener.forEach((fn) => fn())
      })
    })
  }

  async takeTurn(): Promise<void> {
    // Enemy already dead, no need to take turn
    if (this.health <= 0) {
      this.handleDeath()
      return
    }
    this.sprite.idleTween?.stop()

    this.turnsUntilAttack--
    if (this.turnsUntilAttack === 0) {
      // attack animation
      this.game.battleUI.tweenEnemyParallaxBackground(15)
      await this.tweenToPosition(Enemy.POSITION.x + 50, Enemy.POSITION.y)
      await this.playAttackAnimation(this.element)

      this.game.time.delayedCall(500, () => {
        this.game.attackEffectsManager.playImpactAnimation(
          Player.POSITION.x + 50,
          Player.POSITION.y,
          this.element,
          false
        )
        this.attackListener.forEach((fn) => fn(this.baseDamage)) // deal damage
        this.turnsUntilAttack = this.maxTurnsUntilAttack
      })

      this.game.time.delayedCall(500, () => {
        this.tweenToPosition(Enemy.POSITION.x, Enemy.POSITION.y).then(() =>
          this.sprite.idleTween?.restart()
        )
        this.game.battleUI.tweenEnemyParallaxBackground(-15)
        this.endTurn()
      })
    } else {
      this.endTurn()
    }
  }

  protected async playAttackAnimation(element: Elements): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sprite.play(
        () => resolve(), // onComplete
        (frame) => {
          switch (frame) {
            // Frame 1 = charge animation
            case 1:
              this.game.attackEffectsManager.playChargeFX(
                Enemy.POSITION.x + this.chargeAnimationOffset.x,
                Enemy.POSITION.y + this.chargeAnimationOffset.y,
                element,
                false // isFromPlayer
              )
              break
            // Frame 2 = impact animation
            case 2:
              this.game.attackEffectsManager.playAttackFX(
                Enemy.POSITION.x + this.attackAnimationOffset.x,
                Enemy.POSITION.y + this.attackAnimationOffset.y,
                element,
                false // isFromPlayer
              )
              break
          }
        }
      )
    })
  }

  protected async tweenToPosition(x: number, y: number): Promise<void> {
    const startX = this.sprite.sprites[0].x
    const startY = this.sprite.sprites[0].y
    return new Promise((resolve, reject) => {
      this.game.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 500,
        ease: 'expo.out',
        onUpdate: (tween) => {
          const xPos = Phaser.Math.Linear(startX, x, tween.getValue())
          const yPos = Phaser.Math.Linear(startY, y, tween.getValue())
          this.sprite.sprites[0].setPosition(xPos, yPos)
        },
        onComplete: () => {
          resolve()
        },
      })
    })
  }

  protected endTurn() {
    this.sprite.reset()
    this.game.time.delayedCall(500, () => {
      this.nextMoveText.text = `Attacks in ${this.turnsUntilAttack} turn${
        this.turnsUntilAttack == 1 ? '' : 's'
      }`
      this.turnEndListener.forEach((fn) => fn())
    })
  }

  addAttackListener(listener: (damage: number) => void) {
    this.attackListener.push(listener)
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }

  addOnDiedListener(listener: () => void) {
    this.onDiedListener.push(listener)
  }
}
