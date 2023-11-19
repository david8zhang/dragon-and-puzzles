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
      this.cutscene = new Cutscene(this, {
        scenes: Constants.PRE_BOSS_CUTSCENE,
        onComplete: () => {
          this.scene.start('game', { level: 4 })
        },
      })
    } else {
      this.cutscene = new Cutscene(this, {
        scenes: Constants.END_CUTSCENE,
        onComplete: () => {
          const gameScene = this.scene.get('start')
          gameScene.registry.destroy()
          gameScene.scene.restart()
          gameScene.sound.removeAll()

          this.scene.start('start')
        },
      })
    }
  }
}
