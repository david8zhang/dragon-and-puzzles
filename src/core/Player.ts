import 'babel-polyfill'

import { Game } from '~/scenes/Game'
import { Healthbar } from './Healthbar'
import { Board } from './Board'
import { Constants, Elements } from '~/utils/Constants'
import { UINumber } from './UINumber'

export class Player {
  private static readonly MAX_HEALTH: number = 100

  private game: Game
  public element: Elements = Elements.FIRE
  public sprite: Phaser.GameObjects.Sprite

  public readonly maxHealth: number = Player.MAX_HEALTH
  public health: number = this.maxHealth

  private healthBar!: Healthbar
  private attackListener: Array<
    (damagePerElement: { [key in Elements]?: number }) => void
  > = []
  private turnEndListener: Array<() => void> = []

  constructor(game: Game, board: Board) {
    this.game = game
    board.addTurnEndListener((combo) => {
      // Calculate damage from combos and attack enemy
      const damagePerElement = this.calculateComboDamage(combo)
      board.setDisabled(true)
      this.handlePlayerAttack(damagePerElement)
    })

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    this.sprite = this.game.add
      .sprite(175, 275, 'fire-dragon-debug')
      .setScale(2.1)
    this.setupHealthbar()
  }

  setupHealthbar() {
    this.healthBar = new Healthbar(
      this.game,
      {
        // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
        position: {
          x: 300,
          y: this.sprite.y + 50,
        },
        length: 200,
        width: 15,
      },
      this
    )
  }

  handlePlayerAttack(dmgPerElement: { [key in Elements]?: number }) {
    const elements = Object.keys(dmgPerElement).filter(
      (element) => element !== Elements.HEALTH && element !== Elements.NONE
    )
    const shootElementalBlast = (index: number) => {
      if (index == elements.length) {
        this.game.time.delayedCall(500, () => {
          if (this.game.enemy.health == 0) {
            this.game.enemy.onDiedListener.forEach((fn) => fn())
          } else {
            this.game.enemy.takeTurn()
          }
        })
        return
      }
      const element = elements[index]
      const attackOrb = this.game.add.sprite(
        this.sprite.x,
        this.sprite.y,
        `orb-${element}`
      )
      this.game.tweens.add({
        targets: [attackOrb],
        x: {
          from: attackOrb.x,
          to: this.game.enemy.sprite.x,
        },
        y: {
          from: attackOrb.y,
          to: this.game.enemy.sprite.y,
        },
        duration: 500,
        onComplete: () => {
          attackOrb.destroy()

          const hasElementAdv =
            Constants.WEAKNESS_MAP[this.game.enemy.element].includes(element)
          const hasElementDisadv =
            Constants.RESISTANCES_MAP[this.game.enemy.element].includes(element)
          if (hasElementAdv) {
            this.game.cameras.main.shake(250, 0.005)
          }

          UINumber.createNumber(
            `${dmgPerElement[element]}`,
            this.game,
            this.game.enemy.sprite.x,
            this.game.enemy.sprite.y,
            Constants.ELEMENT_TO_COLOR[element],
            hasElementAdv ? '30px' : hasElementDisadv ? '20px' : '25px'
          )
          this.game.enemy.damage(dmgPerElement[element])
          shootElementalBlast(index + 1)
        },
      })
    }
    shootElementalBlast(0)

    // Handle heals
    if (dmgPerElement[Elements.HEALTH] != undefined) {
      const healAmount = dmgPerElement[Elements.HEALTH]
      this.health = Math.min(this.maxHealth, this.health + healAmount)
      this.healthBar.draw()
      UINumber.createNumber(
        `+${healAmount}`,
        this.game,
        this.sprite.x,
        this.sprite.y,
        'white',
        '20px'
      )
    }
  }

  damage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.health = 0
      // TODO: game over
      this.game.scene.start('gameover')
    }
    this.healthBar.draw()
  }

  calculateComboDamage(combos: string[][]): { [key in Elements]?: number } {
    // Group each combo into elements
    const mapping: { [key in Elements]?: number } = {}
    combos.forEach((combo) => {
      const element = combo[0] as Elements
      if (mapping[element] == undefined) {
        mapping[element] = 0
      }
      mapping[element]! += combo.length
    })

    // Factor in elemental weaknesses
    Object.keys(mapping).forEach((element: string) => {
      const enemyElement = this.game.enemy.element
      const enemyWeaknesses = Constants.WEAKNESS_MAP[enemyElement]
      const enemyResistances = Constants.RESISTANCES_MAP[enemyElement]
      if (enemyWeaknesses.includes(element)) {
        mapping[element] = Math.round(mapping[element] * 1.5)
      } else if (enemyResistances.includes(element)) {
        mapping[element] = Math.round(mapping[element] * 0.5)
      }
    })

    return mapping
  }

  addAttackListener(
    listener: (damagePerElement: { [key in Elements]?: number }) => void
  ) {
    this.attackListener.push(listener)
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }
}
