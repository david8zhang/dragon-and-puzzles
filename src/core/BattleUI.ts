import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class BattleUI {
  private game: Game
  private divider: Phaser.GameObjects.Rectangle

  public playerBG: Phaser.GameObjects.Image
  public enemyBG: Phaser.GameObjects.Image
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
    this.playerBG = this.game.add
      .image(0, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.background)
    this.playerBG.setMask(this.playerSideMask)

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
    this.enemyBG = this.game.add
      .image(200, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.background)
    this.enemyBG.setMask(this.enemySideMask)
  }

  async tweenPlayerParallaxBackground(amount: number) {
    return this.tweenParallaxBackground(true, amount)
  }

  async tweenEnemyParallaxBackground(amount: number) {
    return this.tweenParallaxBackground(false, amount)
  }

  shakeBackground(isPlayer: boolean) {
    const image = isPlayer ? this.playerBG : this.enemyBG
    this.game.tweens.add({
      targets: image,
      x: {
        from: image.x,
        to: image.x + (isPlayer ? -3 : 3),
      },
      duration: 10,
      yoyo: true,
      repeat: 10,
    })
  }

  private async tweenParallaxBackground(
    isPlayer: boolean,
    amount: number
  ): Promise<void> {
    const image = isPlayer ? this.playerBG : this.enemyBG
    const startX = image.x
    const endX = image.x + amount
    return new Promise((resolve, reject) => {
      this.game.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 500,
        ease: 'expo.out',
        onUpdate: (tween) => {
          const xPos = Phaser.Math.Linear(startX, endX, tween.getValue())
          image.setPosition(xPos, image.y)
        },
        onComplete: () => {
          resolve()
        },
      })
    })
  }
}
