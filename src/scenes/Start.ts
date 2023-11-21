import { Button } from '~/core/Button'
import { Cutscene } from '~/core/Cutscene'
import { Constants } from '~/utils/Constants'

export class Start extends Phaser.Scene {
  private cutscene!: Cutscene
  private completedTutorial: boolean = false

  constructor() {
    super('start')
  }

  create() {
    this.sound.play('start', { volume: 0.25, loop: true })
    this.cutscene = new Cutscene(this, {
      scenes: Constants.INTRO_CUTSCENE,
      onComplete: () => {
        if (!this.completedTutorial) {
          this.completedTutorial = true
          this.scene.start('tutorial')
        } else {
          this.scene.start('game', { level: 0 })
        }
      },
    })
    this.cutscene.setVisible(false)

    const titleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 3,
        'King of the Dragons',
        {
          fontSize: '45px',
        }
      )
      .setOrigin(0.5, 0.5)
      .setAlign('center')
    const subtitleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        titleText.y + titleText.displayHeight + 5,
        'Scales of Power',
        {
          fontSize: '30px',
          color: 'white',
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
        this.sound.stopAll()
        this.sound.play('intro-cutscene', { volume: 0.25, loop: true })
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
