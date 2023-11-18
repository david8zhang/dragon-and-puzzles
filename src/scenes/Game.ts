import Phaser from 'phaser'
import { Board } from '~/core/Board'
import { ENEMIES, Enemy } from '~/core/Enemy'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export class Game extends Phaser.Scene {
  public board!: Board
  public level: number = 0
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
    this.cameras.main.setBackgroundColor(0x369f5c)
    this.board = new Board(this)

    this.player = new Player(this, this.board)
    this.enemy = new Enemy(this, ENEMIES[this.level])

    this.player.addTurnEndListener(() => {
      this.time.delayedCall(500, () => {
        this.enemy.takeTurn()
      })
    })

    this.enemy.addAttackListener((dmgAmount) => this.player.damage(dmgAmount))
    this.enemy.addTurnEndListener(() => this.board.setDisabled(false))

    // Add BG image
    this.add
      .image(0, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
      .setDepth(this.player.sprite.depth - 1)

    this.enemy.addOnDiedListener(() => {
      if (this.level === ENEMIES.length - 1) {
        this.game.scene.start('victory')
      } else {
        this.game.scene.start('game', { level: this.level + 1 })
      }
    })
  }
}
