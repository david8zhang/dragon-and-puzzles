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
  private attackListener: Array<
    (damagePerElement: { [key in Elements]?: number }) => void
  > = []
  private turnEndListener: Array<() => void> = []

  constructor(game: Game, board: Board) {
    this.game = game

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    this.sprite = new AnimatedSprite(this.game, {
      spriteNames: ['fire-dragon'],
      position: Player.POSITION,
      startFrame: 1,
      endFrame: 2,
      frameDurations: [250, 0],
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
      this.attackListener.forEach((fn) => fn(damagePerElement))
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

  handlePlayerAttack(dmgPerElement: { [key in Elements]?: number }) {
    this.attack(0, dmgPerElement)
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
  }

  private attack(index: number, dmgPerElement: { [key in Elements]?: number }) {
    const availableElements = this.game.board.getElementsForLevel() as string[]
    const elements = Object.keys(dmgPerElement).filter(
      (element) =>
        element !== Elements.HEALTH && availableElements.includes(element)
    )
    if (index == elements.length) {
      this.turnEndListener.forEach((fn) => fn())
      this.sprite.reset()
      return
    }
    this.sprite.play(() => this.shootElementalBlast(index, dmgPerElement))
  }

  shootElementalBlast(
    index: number,
    dmgPerElement: { [key in Elements]?: number }
  ) {
    const availableElements = this.game.board.getElementsForLevel() as string[]
    const elements = Object.keys(dmgPerElement).filter(
      (element) =>
        element !== Elements.HEALTH && availableElements.includes(element)
    )
    const element = elements[index]
    const attackOrb = this.game.add.sprite(
      Player.POSITION.x,
      Player.POSITION.y,
      `orb-${element}`
    )
    this.game.tweens.add({
      targets: [attackOrb],
      x: {
        from: attackOrb.x,
        to: Enemy.POSITION.x,
      },
      y: {
        from: attackOrb.y,
        to: Enemy.POSITION.y,
      },
      duration: 500,
      onComplete: () => {
        attackOrb.destroy()

        const hasElementAdv =
          Constants.WEAKNESS_MAP[this.game.enemy.element].includes(element)
        const hasElementDisadv =
          Constants.RESISTANCES_MAP[this.game.enemy.element].includes(element)
        if (hasElementAdv) {
          this.game.sound.play('effective-attack')
          this.game.cameras.main.shake(250, 0.005)
        } else if (hasElementDisadv) {
          this.game.sound.play('weak-attack')
        } else {
          this.game.sound.play('basic-attack')
        }

        UINumber.createNumber(
          `${dmgPerElement[element]}`,
          this.game,
          Enemy.POSITION.x,
          Enemy.POSITION.y,
          `#${Constants.ELEMENT_TO_COLOR[element]}`,
          hasElementAdv ? '30px' : hasElementDisadv ? '20px' : '25px'
        )
        this.game.enemy.damage(dmgPerElement[element])
        this.attack(index + 1, dmgPerElement)
      },
    })
  }

  damage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.health = 0
      this.game.scene.start('gameover')
    }
    this.healthBar.draw()
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

  addAttackListener(
    listener: (damagePerElement: { [key in Elements]?: number }) => void
  ) {
    this.attackListener.push(listener)
  }

  addTurnEndListener(listener: () => void) {
    this.turnEndListener.push(listener)
  }
}
