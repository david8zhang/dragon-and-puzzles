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
}

export const ENEMIES: EnemyConfig[] = [
  {
    maxHealth: 75,
    spriteName: 'green-dragon',
    element: Elements.GRASS,
    baseDamage: 10,
    maxTurnsUntilAttack: 4,
  },
  {
    maxHealth: 125,
    spriteName: 'water-dragon',
    element: Elements.WATER,
    baseDamage: 15,
    maxTurnsUntilAttack: 3,
  },
  {
    maxHealth: 150,
    spriteName: 'light-dragon',
    element: Elements.LIGHT,
    baseDamage: 20,
    maxTurnsUntilAttack: 3,
  },
  {
    maxHealth: 150,
    spriteName: 'dark-dragon',
    element: Elements.DARK,
    baseDamage: 20,
    maxTurnsUntilAttack: 3,
  },
]

export class Enemy {
  public static readonly POSITION: { x: number; y: number } = {
    x: 465,
    y: 125,
  }

  public readonly maxHealth: number
  public health: number
  public healthBar!: Healthbar
  public sprite: AnimatedSprite
  public element!: Elements

  protected game: Game
  protected turnsUntilAttack: number = 1
  protected maxTurnsUntilAttack: number = 3
  protected baseDamage: number = 0
  protected nextMoveText: Phaser.GameObjects.Text
  protected attackListener: Array<(damage: number) => void> = []
  protected turnEndListener: Array<() => void> = []
  public onDiedListener: Array<() => void> = []

  constructor(game: Game, config: EnemyConfig) {
    this.game = game

    // Set up health
    this.maxHealth = config.maxHealth
    this.health = this.maxHealth
    this.baseDamage = config.baseDamage
    this.maxTurnsUntilAttack = config.maxTurnsUntilAttack
    this.setupHealthbar()

    this.sprite = this.setupSprite(config)

    // Set up next move text
    // TODO: Refactor this into its own fn?
    this.nextMoveText = this.game.add
      .text(
        Enemy.POSITION.x,
        Enemy.POSITION.y - 110,
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
      frameDurations: [250, 0],
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

  handleDeath() {
    this.nextMoveText.setVisible(false)
    this.sprite.fade(() => {
      this.game.time.delayedCall(500, () => {
        this.onDiedListener.forEach((fn) => fn())
      })
    })
    // this.game.tweens.add({
    //   targets: this.sprite,
    //   alpha: {
    //     from: 1,
    //     to: 0,
    //   },
    //   duration: 1000,
    //   onComplete: () => {
    //     this.game.time.delayedCall(500, () => {
    //       this.onDiedListener.forEach((fn) => fn())
    //     })
    //   },
    // })
  }

  async takeTurn(): Promise<void> {
    // Enemy already dead, no need to take turn
    if (this.health <= 0) {
      this.handleDeath()
      return
    }

    this.turnsUntilAttack--
    if (this.turnsUntilAttack === 0) {
      // attack animation
      this.sprite.play(() => this.attack())
    } else {
      this.endTurn()
    }
  }

  attack() {
    const attackOrb = this.game.add
      .sprite(Enemy.POSITION.x, Enemy.POSITION.y, `orb-${this.element}`)
      .setDepth(1000)
    this.game.tweens.add({
      targets: [attackOrb],
      duration: 500,
      x: {
        from: Enemy.POSITION.x,
        to: Player.POSITION.x,
      },
      y: {
        from: Enemy.POSITION.y,
        to: Player.POSITION.y,
      },
      onComplete: () => {
        attackOrb.destroy()
        this.attackListener.forEach((fn) => fn(this.baseDamage)) // deal 10 damage
        this.turnsUntilAttack = Phaser.Math.Between(1, this.maxTurnsUntilAttack)
        this.game.sound.play('basic-attack')
        UINumber.createNumber(
          `${this.baseDamage}`,
          this.game,
          Player.POSITION.x,
          Player.POSITION.y,
          'white',
          '25px'
        )
        this.endTurn()
      },
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
