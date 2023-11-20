import { Scene } from 'phaser'
import { Constants } from '~/utils/Constants'

export interface CutsceneConfig {
  scenes: {
    text: string
    imageSrc: string
  }[]
  onComplete: Function
}

export class Cutscene {
  private scenes: {
    text: string
    imageSrc: string
  }[]
  private onComplete: Function
  private bgImage: Phaser.GameObjects.Image
  private text: Phaser.GameObjects.Text
  private textBox: Phaser.GameObjects.Rectangle
  private continueButtonText: Phaser.GameObjects.Text
  private cutsceneIndex: number = 0

  private game: Scene

  constructor(game: Scene, config: CutsceneConfig) {
    this.game = game
    this.scenes = config.scenes
    this.onComplete = config.onComplete
    this.bgImage = this.game.add
      .image(0, 0, '')
      .setDisplaySize(Constants.WINDOW_WIDTH, Constants.WINDOW_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.background)

    this.text = this.game.add
      .text(30, Constants.WINDOW_HEIGHT - 150, '', {
        fontSize: '20px',
        color: 'white',
      })
      .setWordWrapWidth(Constants.WINDOW_WIDTH - 30)
      .setDepth(Constants.SORT_ORDER.top)
      .setOrigin(0, 0)
    this.textBox = this.game.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2,
        this.text.y - 30,
        Constants.WINDOW_WIDTH,
        300,
        0x000000
      )
      .setAlpha(0.5)
      .setOrigin(0.5, 0)
      .setDepth(Constants.SORT_ORDER.ui)

    this.continueButtonText = this.game.add
      .text(
        Constants.WINDOW_WIDTH - 30,
        Constants.WINDOW_HEIGHT - 15,
        'Continue',
        {
          fontSize: '20px',
          color: 'white',
        }
      )
      .setOrigin(1, 1)
      .setStroke('white', 1)
      .setInteractive({ cursor: 'pointer' })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.cutsceneIndex++
        if (this.cutsceneIndex >= this.scenes.length) {
          this.onComplete()
        } else {
          this.renderCutscene()
        }
      })
      .setDepth(Constants.SORT_ORDER.ui)
    this.renderCutscene()
  }

  renderCutscene() {
    const cutscene = this.scenes[this.cutsceneIndex]
    this.text.setText(cutscene.text)
    this.bgImage.setTexture(cutscene.imageSrc)
  }

  setVisible(isVisible: boolean) {
    this.bgImage.setVisible(isVisible)
    this.continueButtonText.setVisible(isVisible)
    this.text.setVisible(isVisible)
    this.textBox.setVisible(isVisible)
  }
}
