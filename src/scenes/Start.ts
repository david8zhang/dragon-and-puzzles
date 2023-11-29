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
    const startImage = this.add
      .image(0, 0, 'intro-1')
      .setOrigin(0, 0)
      .setAlpha(0.5)
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
          fontSize: '26px',
          fontFamily: 'dungeon-depths',
        }
      )
      .setOrigin(0.5, 0.5)
      .setStroke('black', 10)
      .setAlign('center')
    const subtitleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        titleText.y + titleText.displayHeight + 5,
        'The Scales of Power',
        {
          fontSize: '35px',
          color: 'white',
          fontFamily: 'black-chancery',
        }
      )
      .setOrigin(0.5, 0.5)
      .setStroke('black', 10)
      .setAlign('center')
    const startButton = new Button({
      scene: this,
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT / 2 + 100,
      text: 'Start',
      onClick: () => {
        startImage.setVisible(false)
        this.sound.stopAll()
        this.sound.play('intro-cutscene', { volume: 0.25, loop: true })
        titleText.setVisible(false)
        startButton.setVisible(false)
        subtitleText.setVisible(false)
        this.cutscene.setVisible(true)
      },
      width: 200,
      height: 50,
      fontSize: '10px',
      fontFamily: 'dungeon-depths',
      backgroundColor: 0xffffff,
    })
  }
}
