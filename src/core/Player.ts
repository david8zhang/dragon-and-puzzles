import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Board } from './Board'
import { Constants, Elements } from '~/utils/Constants'
import { UINumber } from './UINumber'
import { Enemy } from './Enemy'
import { AnimatedSprite } from './AnimatedSprite'

export class Player {
  public static readonly POSITION: { x: number; y: number } = {
    x: 150,
    y: 200,
  }
  private static readonly MAX_HEALTH: number = 100

  private game: Game
  public element: Elements = Elements.FIRE
  public sprite: AnimatedSprite

  public readonly maxHealth: number = Player.MAX_HEALTH
  public health: number = this.maxHealth

  private healthBar!: Healthbar
  private turnEndListener: Array<() => void> = []

  constructor(game: Game, board: Board) {
    this.game = game

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    this.sprite = new AnimatedSprite(this.game, {
      spriteNames: ['fire-dragon'],
      position: Player.POSITION,
      startFrame: 1,
      endFrame: 2,
      frameRate: 2.5,
      isCharacter: true,
    })

    this.setupHealthbar()
    this.setupTurnEndListener(board)
  }

  setupTurnEndListener(board: Board) {
    board.addTurnEndListener((combo) => {
      // Calculate damage from combos and attack enemy
      const damagePerElement = this.calculateComboDamageOrHealAmt(combo)
      board.setDisabled(true)
      this.handlePlayerAttack(damagePerElement)
    })
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        position: {
          x: Player.POSITION.x - 125,
          y: Player.POSITION.y - 150,
        },
        length: 200,
        width: 15,
      },
      this
    )
  }

  async handlePlayerAttack(dmgPerElement: { [key in Elements]?: number }) {
    this.sprite.idleTween?.stop()
    const availableElements = this.game.board.getElementsForLevel() as string[]
    const elements = Object.keys(dmgPerElement).filter(
      (element) =>
        element !== Elements.HEALTH && availableElements.includes(element)
    )

    if (elements.length > 0) {
      this.game.battleUI.tweenPlayerParallaxBackground(-15)
      await this.tweenToPosition(Player.POSITION.x - 50, Player.POSITION.y)
    }

    // Play attack animation for each element
    for (const element of elements) {
      await this.playAttackAnimation(element as Elements)

      this.game.time.delayedCall(500, () => {
        this.game.attackEffectsManager.playImpactAnimation(
          Enemy.POSITION.x,
          Enemy.POSITION.y - 10,
          element as Elements,
          true // isFromPlayer
        )
        this.game.enemy.damage(dmgPerElement[element], element as Elements)
      })
    }

    // Handle heals
    if (dmgPerElement[Elements.HEALTH] != undefined) {
      const healAmount = Math.round(
        dmgPerElement[Elements.HEALTH] * Constants.HEAL_MULTIPLIER
      )
      this.health = Math.min(this.maxHealth, this.health + healAmount)
      this.healthBar.draw()
      this.game.sound.play('heal', { volume: 0.1 })
      UINumber.createNumber(
        `+${healAmount}`,
        this.game,
        Player.POSITION.x,
        Player.POSITION.y,
        'white',
        '20px'
      )
    }

    this.game.time.delayedCall(500, () => {
      // if we attacked, move the player back
      if (elements.length > 0) {
        this.tweenToPosition(Player.POSITION.x, Player.POSITION.y).then(() =>
          this.sprite.idleTween?.restart()
        )
        this.game.battleUI.tweenPlayerParallaxBackground(15)
      }
      this.turnEndListener.forEach((fn) => fn())
      this.sprite.reset()
    })
  }

  async tweenToPosition(x: number, y: number): Promise<void> {
    const startX = this.sprite.sprites[0].x
    const startY = this.sprite.sprites[0].y
    return new Promise((resolve, reject) => {
      this.game.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 500,
        ease: 'expo.out',
        onUpdate: (tween) => {
          const xPos = Phaser.Math.Linear(startX, x, tween.getValue())
          const yPos = Phaser.Math.Linear(startY, y, tween.getValue())
          this.sprite.sprites[0].setPosition(xPos, yPos)
        },
        onComplete: () => {
          resolve()
        },
      })
    })
  }

  private async playAttackAnimation(element: Elements): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sprite.play(
        () => resolve(), // onComplete
        (frame) => {
          switch (frame) {
            // Frame 1 = charge animation
            case 1:
              this.game.attackEffectsManager.playChargeFX(
                Player.POSITION.x - 20,
                Player.POSITION.y - 30,
                element,
                true // isFromPlayer
              )
              break
            // Frame 2 = impact animation
            case 2:
              this.game.attackEffectsManager.playAttackFX(
                Player.POSITION.x + 120,
                Player.POSITION.y - 10,
                element,
                true // isFromPlayer
              )
              break
          }
        }
      )
    })
  }

  damage(amount: number) {
    this.health -= amount
    UINumber.createNumber(
      `${amount}`,
      this.game,
      Player.POSITION.x,
      Player.POSITION.y,
      'white',
      '25px'
    )
    this.sprite.flash()
    this.game.battleUI.shakeBackground(true)
    this.game.sound.play('basic-attack')
    this.healthBar.draw()

    if (this.health <= 0) {
      this.health = 0
      this.game.scene.start('gameover')
    }
  }

  calculateComboDamageOrHealAmt(combos: string[][]): {
    [key in Elements]?: number
  } {
    const comboMultiplier = 1 + (combos.length - 1) * 0.25

    // Group each combo into elements
    const mapping: { [key in Elements]?: number } = {}
    combos.forEach((combo) => {
      const element = combo[0] as Elements
      if (mapping[element] == undefined) {
        mapping[element] = 0
      }
      mapping[element]! += Math.round(combo.length * comboMultiplier)
    })

    // Factor in elemental weaknesses
    Object.keys(mapping).forEach((element: string) => {
      const enemyElement = this.game.enemy.element
      const enemyWeaknesses = Constants.WEAKNESS_MAP[enemyElement]
      const enemyResistances = Constants.RESISTANCES_MAP[enemyElement]
      if (enemyWeaknesses.includes(element)) {
        mapping[element] = Math.round(mapping[element] * 1.25)
      } else if (enemyResistances.includes(element)) {
        mapping[element] = Math.round(mapping[element] * 0.75)
      }
    })

    return mapping
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }
}
