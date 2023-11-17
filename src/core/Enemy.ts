import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Constants, Elements } from '~/utils/Constants'
import { UINumber } from './UINumber'

export interface EnemyConfig {
  maxHealth: number
  spriteName: string
  element: Elements
  baseDamage: number
}

export const ENEMIES: EnemyConfig[] = [
  {
    maxHealth: 50,
    spriteName: 'green-dragon-debug',
    element: Elements.GRASS,
    baseDamage: 10,
  },
  {
    maxHealth: 75,
    spriteName: 'water-dragon-debug',
    element: Elements.WATER,
    baseDamage: 15,
  },
  {
    maxHealth: 100,
    spriteName: 'light-dragon-debug',
    element: Elements.LIGHT,
    baseDamage: 20,
  },
  {
    maxHealth: 125,
    spriteName: 'dark-dragon-debug',
    element: Elements.DARK,
    baseDamage: 20,
  },
  {
    maxHealth: 200,
    spriteName: 'rainbow-debug',
    element: Elements.ALL,
    baseDamage: 25,
  },
]

export class Enemy {
  private static readonly POSITION: { x: number; y: number } = {
    x: 465,
    y: 125,
  }

  public readonly maxHealth: number
  public health: number
  public healthBar!: Healthbar
  public sprite: Phaser.GameObjects.Sprite
  public element!: Elements

  private isRainbow: boolean = false
  private game: Game
  private turnsUntilAttack: number = 1
  private baseDamage: number = 0
  private nextMoveText: Phaser.GameObjects.Text
  private attackListener: Array<(damage: number) => void> = []
  private turnEndListener: Array<() => void> = []
  public onDiedListener: Array<() => void> = []

  constructor(game: Game, config: EnemyConfig) {
    this.game = game

    // Set up health
    this.maxHealth = config.maxHealth
    this.health = this.maxHealth
    this.baseDamage = config.baseDamage
    this.setupHealthbar()

    // Set up sprite
    // TODO: add animations for enemy
    this.sprite = this.game.add
      .sprite(Enemy.POSITION.x, Enemy.POSITION.y, config.spriteName)
      .setScale(2.1)

    // Set up next move text
    // TODO: Refactor this into its own fn?
    this.nextMoveText = this.game.add
      .text(
        Enemy.POSITION.x,
        Enemy.POSITION.y - 115,
        `Attacks in ${this.turnsUntilAttack} turn${
          this.turnsUntilAttack == 1 ? '' : 's'
        }`
      )
      .setStyle({
        fontSize: '20px',
      })
      .setStroke('#000000', 5)
    // Center align text
    this.nextMoveText.setPosition(
      this.nextMoveText.x - this.nextMoveText.displayWidth / 2,
      this.nextMoveText.y
    )
    this.animateNextMoveText()

    // If this is the rainbow dragon, pick a random element and change the tint
    if (config.element === Elements.ALL) {
      this.isRainbow = true
      this.morphToRandomElement()
    } else {
      this.element = config.element
    }
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
          x: Enemy.POSITION.x - 390,
          y: Enemy.POSITION.y - 50,
        },
        length: 200,
        width: 15,
      },
      this
    )
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount)
    this.healthBar.draw()
  }

  calculateDamageWithResistances() {
    if (this.element == Elements.DARK) {
      return this.baseDamage * 1.75 // Dark deals more damage
    } else {
      const playerElement = this.game.player.element
      const playerWeaknesses = Constants.WEAKNESS_MAP[playerElement]
      const playerResistances = Constants.RESISTANCES_MAP[playerElement]
      if (playerWeaknesses.includes(this.element)) {
        return Math.round(this.baseDamage * 1.5)
      } else if (playerResistances.includes(this.element)) {
        return Math.round(this.baseDamage * 0.5)
      } else {
        return this.baseDamage
      }
    }
  }

  handleDeath() {
    this.game.tweens.add({
      targets: this.sprite,
      onStart: () => {
        this.nextMoveText.setVisible(false)
      },
      alpha: {
        from: 1,
        to: 0,
      },
      duration: 1000,
      onComplete: () => {
        this.game.time.delayedCall(500, () => {
          this.onDiedListener.forEach((fn) => fn())
        })
      },
    })
  }

  async takeTurn(): Promise<void> {
    // Enemy already dead, no need to take turn
    if (this.health <= 0) {
      this.handleDeath()
      return
    }

    this.turnsUntilAttack--
    if (this.turnsUntilAttack === 0) {
      const attackOrb = this.game.add
        .sprite(this.sprite.x, this.sprite.y, `orb-${this.element}`)
        .setDepth(1000)
      this.game.tweens.add({
        targets: [attackOrb],
        duration: 500,
        x: {
          from: this.sprite.x,
          to: this.game.player.sprite.x,
        },
        y: {
          from: this.sprite.y,
          to: this.game.player.sprite.y,
        },
        onComplete: () => {
          attackOrb.destroy()
          const damage = this.calculateDamageWithResistances()
          this.attackListener.forEach((fn) => fn(damage)) // deal 10 damage
          this.turnsUntilAttack = Math.floor(Math.random() * 3 + 1)
          UINumber.createNumber(
            `${damage}`,
            this.game,
            this.game.player.sprite.x,
            this.game.player.sprite.y,
            Constants.ELEMENT_TO_COLOR[this.element],
            '25px'
          )

          // If the enemy is the rainbow dragon, change the typing every time it attacks
          if (this.isRainbow) {
            this.morphToRandomElement()
          }

          this.endTurn()
        },
      })
    } else {
      this.endTurn()
    }
  }

  endTurn() {
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
