import Phaser from 'phaser'
import { Board } from '~/core/Board'
import { ENEMIES, Enemy } from '~/core/Enemy'
import { Player } from '~/core/Player'

export class Game extends Phaser.Scene {
  public board!: Board
  public level!: number
  public player!: Player
  public enemy!: Enemy

  constructor() {
    super('game')
  }

  init(data): void {
    if (data.level) {
      this.level = data.level
    }
  }

  create() {
    this.board = new Board(this)
    this.level = this.level ?? 0

    this.player = new Player(this, this.board)
    this.enemy = new Enemy(this, ENEMIES[this.level])

    this.enemy.addAttackListener((dmgAmount) => this.player.damage(dmgAmount))
    this.enemy.addTurnEndListener(() => this.board.setDisabled(false))

    this.enemy.addOnDiedListener(() => {
      if (this.level === ENEMIES.length - 1) {
        this.game.scene.start('gameover')
      } else {
        this.game.scene.start('game', { level: this.level + 1 })
      }
    })
  }
}
