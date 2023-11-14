import Phaser from 'phaser'
import { Board } from '~/core/Board'
import { ENEMIES, Enemy, EnemyConfig } from '~/core/Enemy'
import { Player } from '~/core/Player'

export class Game extends Phaser.Scene {
  public board!: Board
  public level!: number

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

    const player = new Player(this, this.board)
    const enemy = new Enemy(this, ENEMIES[this.level])

    player.addAttackListener((dmgAmount) => enemy.damage(dmgAmount))
    player.addTurnEndListener(() => enemy.takeTurn())

    enemy.addAttackListener((dmgAmount) => player.damage(dmgAmount))
    enemy.addTurnEndListener(() => this.board.setDisabled(false))

    enemy.addOnDiedListener(() => {
      console.log('enemy died, next level: ', this.level + 1)
      if (this.level === ENEMIES.length - 1) {
        this.game.scene.start('gameover')
      } else {
        this.game.scene.start('game', { level: this.level + 1 })
      }
    })
  }
}
