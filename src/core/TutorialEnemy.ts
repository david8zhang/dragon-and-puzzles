import { Game } from '~/scenes/Game'
import { Enemy, EnemyConfig } from './Enemy'

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

  damage(amount: number) {
    if (!this.isInvulnerable) {
      super.damage(amount)
    }
  }
}
