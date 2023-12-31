import Phaser from 'phaser'
import { Button } from '~/core/Button'
import { Constants } from '~/utils/Constants'

export default class GameOver extends Phaser.Scene {
  constructor() {
    super('gameover')
  }

  create(): void {
    this.sound.stopAll()
    this.sound.play('defeat', { volume: 0.25 })
    this.add.image(
      Constants.WINDOW_WIDTH / 2,
      Constants.WINDOW_HEIGHT / 2,
      'game-over'
    )
    const button = new Button({
      scene: this,
      strokeColor: 0x000000,
      width: 200,
      height: 50,
      text: 'Play Again',
      backgroundColor: 0xffffff,
      onClick: () => {
        const gameScene = this.scene.get('game')
        gameScene.registry.destroy()
        gameScene.scene.restart()
        gameScene.sound.removeAll()
        this.scene.start('game', {
          level: 0,
        })
      },
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT / 2,
      fontSize: '10px',
      fontFamily: 'dungeon-depths',
    })
    button.setVisible(false)

    this.cameras.main.fadeIn(2000, 1, 1, 1, (camera, progress) => {
      if (progress == 1) {
        button.setVisible(true)
      }
    })
  }
}
