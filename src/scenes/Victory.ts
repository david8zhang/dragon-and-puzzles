import { Button } from '~/core/Button'
import { Cutscene } from '~/core/Cutscene'
import { Constants } from '~/utils/Constants'

export class Victory extends Phaser.Scene {
  private isPreBoss: boolean = false
  private cutscene!: Cutscene

  constructor() {
    super('victory')
  }

  init(data) {
    this.isPreBoss = data.isPreBoss
  }

  create() {
    if (this.isPreBoss) {
      this.sound.stopAll()
      this.sound.play('final-boss-1', { volume: 0.25 })
      this.cutscene = new Cutscene(this, {
        scenes: Constants.PRE_BOSS_CUTSCENE,
        onComplete: () => {
          this.scene.start('game', { level: 4 })
        },
        onSceneTransition: (index) => {
          if (index == Constants.PRE_BOSS_CUTSCENE.length - 1) {
            this.sound.stopAll()
            this.sound.play('final-boss-2', { volume: 0.25 })
          }
        },
      })
    } else {
      this.sound.stopAll()
      this.sound.play('game-victory', { volume: 0.25 })
      this.cutscene = new Cutscene(this, {
        scenes: Constants.END_CUTSCENE,
        onComplete: () => {
          const gameScene = this.scene.get('game')
          gameScene.registry.destroy()
          gameScene.sound.removeAll()

          const tutorialScene = this.scene.get('tutorial')
          tutorialScene.registry.destroy()
          tutorialScene.sound.removeAll()

          this.scene.stop('tutorial')
          this.scene.stop('game')

          this.scene.bringToTop('start')
          this.scene.start('start')
        },
      })
    }
  }
}
