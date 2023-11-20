import { Button } from '~/core/Button'
import { Cutscene } from '~/core/Cutscene'
import { Constants } from '~/utils/Constants'

export class Start extends Phaser.Scene {
  private cutscene!: Cutscene

  constructor() {
    super('start')
  }

  create() {
    this.cutscene = new Cutscene(this, {
      scenes: Constants.INTRO_CUTSCENE,
      onComplete: () => {
        this.scene.start('game', { level: 0 })
      },
    })
    this.cutscene.setVisible(false)

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
        titleText.setVisible(false)
        startButton.setVisible(false)
        this.cutscene.setVisible(true)
      },
      width: 200,
      height: 50,
      fontSize: '20px',
      backgroundColor: 0xffffff,
    })
  }
}
