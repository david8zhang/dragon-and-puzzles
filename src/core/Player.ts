import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Board } from './Board'
import { Elements } from '~/utils/Constants'
import { UINumber } from './UINumber'

export class Player {
  private static readonly MAX_HEALTH: number = 100

  private game: Game
  public sprite: Phaser.GameObjects.Sprite

  public readonly maxHealth: number = Player.MAX_HEALTH
  public health: number = this.maxHealth

  private healthBar!: Healthbar
  private attackListener: Array<
    (damagePerElement: { [key in Elements]?: number }) => void
  > = []
  private turnEndListener: Array<() => void> = []

  constructor(game: Game, board: Board) {
    this.game = game
    board.addTurnEndListener((combo) => {
      // Calculate damage from combos and attack enemy
      const damagePerElement = this.calculateComboDamage(combo)
      board.setDisabled(true)
      this.handlePlayerAttack(damagePerElement)
    })

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    this.sprite = this.game.add
      .sprite(175, 275, 'fire-dragon-debug')
      .setScale(2.1)
    this.setupHealthbar()
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
        position: {
          x: 300,
          y: this.sprite.y + 50,
        },
        length: 200,
        width: 15,
      },
      this
    )
  }

  handlePlayerAttack(dmgPerElement: { [key in Elements]?: number }) {
    const elements = Object.keys(dmgPerElement).filter(
      (element) => element !== Elements.HEALTH
    )
    const shootElementalBlast = (index: number) => {
      if (index == elements.length) {
        this.game.time.delayedCall(500, () => {
          this.game.enemy.takeTurn()
        })
        return
      }
      const element = elements[index]
      const attackOrb = this.game.add.sprite(
        this.sprite.x,
        this.sprite.y,
        `orb-${element}`
      )
      this.game.tweens.add({
        targets: [attackOrb],
        x: {
          from: attackOrb.x,
          to: this.game.enemy.sprite.x,
        },
        y: {
          from: attackOrb.y,
          to: this.game.enemy.sprite.y,
        },
        duration: 500,
        onComplete: () => {
          attackOrb.destroy()
          UINumber.createNumber(
            `${dmgPerElement[element]}`,
            this.game,
            this.game.enemy.sprite.x,
            this.game.enemy.sprite.y,
            'white',
            '20px'
          )
          this.game.enemy.damage(dmgPerElement[element])
          shootElementalBlast(index + 1)
        },
      })
    }
    shootElementalBlast(0)
  }

  damage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.health = 0
      // TODO: game over
      this.game.scene.start('gameover')
    }
    this.healthBar.draw()
  }

  calculateComboDamage(combos: string[][]): { [key in Elements]?: number } {
    // Group each combo into elements
    const mapping: { [key in Elements]?: number } = {}
    combos.forEach((combo) => {
      const element = combo[0] as Elements
      if (mapping[element] == undefined) {
        mapping[element] = 0
      }
      mapping[element]! += combo.length
    })
    return mapping
  }

  addAttackListener(
    listener: (damagePerElement: { [key in Elements]?: number }) => void
  ) {
    this.attackListener.push(listener)
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }
}
