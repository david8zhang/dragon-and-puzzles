import { Game } from '~/scenes/Game'
import { AnimatedSprite } from './AnimatedSprite'
import { Elements } from '~/utils/Constants'

export class AttackEffectsManager {
  private game: Game

  constructor(game: Game) {
    this.game = game
  }

  playChargeFX(x: number, y: number, element: Elements, isFromPlayer: boolean) {
    const chargeFX = new AnimatedSprite(this.game, {
      spriteNames: [`${element}-attack-charge`],
      position: {
        x,
        y,
      },
      frameRate: 12,
      destroyOnComplete: true,
    })
    if (isFromPlayer) chargeFX.setMask(this.game.playerSideMask)
    else chargeFX.setMask(this.game.enemySideMask)
    chargeFX.setFlipX(!isFromPlayer)
    chargeFX.play()
  }

  playAttackFX(x: number, y: number, element: Elements, isFromPlayer: boolean) {
    const attackFX = new AnimatedSprite(this.game, {
      spriteNames: [`${element}-attack`],
      position: {
        x,
        y,
      },
      frameRate: 12,
      destroyOnComplete: true,
    })
    if (isFromPlayer) attackFX.setMask(this.game.playerSideMask)
    else attackFX.setMask(this.game.enemySideMask)
    attackFX.setFlipX(!isFromPlayer)
    attackFX.play()
  }

  playImpactAnimation(
    x: number,
    y: number,
    element: Elements,
    isFromPlayer: boolean
  ) {
    const impactFX = new AnimatedSprite(this.game, {
      spriteNames: [`${element}-attack-impact`],
      position: {
        x,
        y,
      },
      frameRate: 12,
      destroyOnComplete: true,
    })
    if (!isFromPlayer) impactFX.setMask(this.game.playerSideMask)
    else impactFX.setMask(this.game.enemySideMask)
    impactFX.setFlipX(!isFromPlayer)
    impactFX.play()
  }
}
