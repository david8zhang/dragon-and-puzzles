import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Board } from './Board'

export class Player {
  private static readonly MAX_HEALTH: number = 100

  private game: Game

  public readonly maxHealth: number = Player.MAX_HEALTH
  public health: number = this.maxHealth

  private healthBar!: Healthbar
  private attackListener: Array<(damage: number) => void> = []
  private turnEndListener: Array<() => void> = []

  constructor(game: Game, board: Board) {
    this.game = game
    this.setupHealthbar()

    board.addTurnEndListener(async (combo) => {
      // Calculate damage from combos and attack enemy
      const damage = this.calculateComboDamage(combo)
      board.setDisabled(true)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // emulating attack animation TODO: add attack animation
      this.attackListener.forEach((fn) => fn(damage))
      this.turnEndListener.forEach((fn) => fn())
    })

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    const playerSprite = this.game.add
      .sprite(175, 225, 'fire-dragon-debug')
      .setScale(2.1)
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
        position: {
          x: 300,
          y: 250,
        },
        length: 200,
        width: 15,
      },
      this
    )
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

  calculateComboDamage(combos: string[][]): number {
    //TODO: better calculation for damage (for now it's just total length of all combos)
    const damage = combos.reduce((sum, combo) => sum + combo.length, 0)
    return damage
  }

  addAttackListener(listener: (damage: number) => void) {
    this.attackListener.push(listener)
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }
}
