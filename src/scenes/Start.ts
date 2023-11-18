import { Button } from '~/core/Button'
import { Constants } from '~/utils/Constants'

export class Start extends Phaser.Scene {
  constructor() {
    super('start')
  }

  create() {
    const titleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 3,
        'Dragon and Puzzles',
        {
          fontSize: '45px',
        }
      )
      .setOrigin(0.5, 0.5)
      .setAlign('center')
    const startButton = new Button({
      scene: this,
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT / 2,
      text: 'Start',
      onClick: () => {
        this.scene.start('game')
      },
      width: 200,
      height: 50,
      fontSize: '20px',
      backgroundColor: 0xffffff,
    })
  }
}
