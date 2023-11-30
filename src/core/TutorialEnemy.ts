import { Game } from '~/scenes/Game'
import { Enemy, EnemyConfig } from './Enemy'
import { Elements } from '~/utils/Constants'

export class TutorialEnemy extends Enemy {
  private isInvulnerable = false

  constructor(scene: Game, enemyConfig: EnemyConfig) {
    super(scene, enemyConfig)
    this.nextMoveText.setVisible(false)
    this.healthBar.toggleHealthText(false)
  }

  toggleInvulnerable(invulnerable: boolean) {
    this.isInvulnerable = invulnerable
  }

  toggleNextMoveText(show: boolean) {
    this.nextMoveText.setVisible(show)
  }

  toggleHealthText(show: boolean) {
    this.healthBar.toggleHealthText(show)
  }

  damage(amount: number, element: Elements) {
    if (!this.isInvulnerable) {
      super.damage(amount, element)
    } else {
      this.game.sound.play('effective-attack')
    }
  }
}
