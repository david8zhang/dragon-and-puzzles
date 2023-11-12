import Phaser from 'phaser'
import { Board } from '~/core/Board'
import { Enemy } from '~/core/Enemy'
import { Player } from '~/core/Player'

export class Game extends Phaser.Scene {
  public board!: Board

  constructor() {
    super('game')
  }

  create() {
    this.board = new Board(this)

    const player = new Player(this, this.board)
    const enemy = new Enemy(this)

    player.addAttackListener((dmgAmount) => enemy.damage(dmgAmount))
    player.addTurnEndListener(() => enemy.takeTurn())

    enemy.addAttackListener((dmgAmount) => player.damage(dmgAmount))
    enemy.addTurnEndListener(() => this.board.setDisabled(false))
  }
}
