import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class BattleUI {
  private game: Game
  private divider: Phaser.GameObjects.Rectangle

  public playerSideMask: Phaser.Display.Masks.BitmapMask
  public enemySideMask: Phaser.Display.Masks.BitmapMask

  constructor(game: Game) {
    this.game = game
    this.divider = this.game.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2 - 2,
        Constants.WINDOW_HEIGHT / 4,
        2,
        Constants.WINDOW_HEIGHT / 2,
        0x000000,
        1.0
      )
      .setDepth(Constants.SORT_ORDER.top)

    const playerMaskRect = this.game.add.graphics()
    playerMaskRect.fillStyle(0xffffff)
    playerMaskRect
      .fillRect(
        0,
        0,
        Constants.WINDOW_WIDTH / 2 - 2,
        Constants.WINDOW_HEIGHT / 2 - 25
      )
      .setDepth(Constants.SORT_ORDER.background - 1)
    this.playerSideMask = new Phaser.Display.Masks.BitmapMask(
      this.game,
      playerMaskRect
    )
    // Add player BG image
    const playerBG = this.game.add
      .image(0, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.background)
    playerBG.setMask(this.playerSideMask)

    // enemy side mask
    const enemyMaskRect = this.game.add.graphics()
    enemyMaskRect.fillStyle(0xffffff)
    enemyMaskRect
      .fillRect(
        Constants.WINDOW_WIDTH / 2 + 2,
        0,
        Constants.WINDOW_WIDTH / 2 - 2,
        Constants.WINDOW_HEIGHT / 2 - 25
      )
      .setDepth(Constants.SORT_ORDER.background - 1)
    this.enemySideMask = new Phaser.Display.Masks.BitmapMask(
      this.game,
      enemyMaskRect
    )

    // Add enemy BG image
    const enemyBG = this.game.add
      .image(200, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.background)
    enemyBG.setMask(this.enemySideMask)
  }
}
