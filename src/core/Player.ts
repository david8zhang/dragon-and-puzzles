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

    // TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
    this.sprite = this.game.add.sprite(175, 275, 'fire-dragon').setScale(2.0)
    this.setupHealthbar()
    this.setupTurnEndListener(board)
    this.setupAnimations('fire-dragon')
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

  setupAnimations(spriteName: string) {
    const attackFrames = this.game.anims.generateFrameNumbers(spriteName, {
      start: 1,
      end: 2,
    })
    this.sprite.anims.create({
      key: 'attack',
      frames: attackFrames,
      frameRate: 4,
    })
    this.sprite.on('animationupdate', () => {
      this.boingSprite()
    })
  }

  // Make sprite go boing
  boingSprite() {
    this.game.tweens.addCounter({
      from: -1,
      to: 1,
      duration: 200,
      ease: 'back.out',
      onUpdate: (tween) => {
        this.sprite.scaleX = 2 + tween.getValue() * 0.1
        this.sprite.scaleY = 2 - tween.getValue() * 0.1
      },
    })
  }

  handlePlayerAttack(dmgPerElement: { [key in Elements]?: number }) {
    this.playAttackAnimation(0, dmgPerElement)
    // Handle heals
    if (dmgPerElement[Elements.HEALTH] != undefined) {
      const healAmount = dmgPerElement[Elements.HEALTH]
      this.health = Math.min(this.maxHealth, this.health + healAmount)
      this.healthBar.draw()
      this.game.sound.play('heal', { volume: 0.1 })
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

  playAttackAnimation(
    index: number,
    dmgPerElement: { [key in Elements]?: number }
  ) {
    const elements = Object.keys(dmgPerElement).filter(
      (element) => element !== Elements.HEALTH && element !== Elements.NONE
    )
    console.log('index:', index)
    if (index == elements.length) {
      this.turnEndListener.forEach((fn) => fn())
      this.sprite.setFrame(0)
      console.log('end')
      return
    }
    this.sprite.play('attack')
    this.sprite.on('animationcomplete', () => {
      this.shootElementalBlast(index, dmgPerElement)
      this.sprite.removeAllListeners('animationcomplete')
    })
  }

  shootElementalBlast(
    index: number,
    dmgPerElement: { [key in Elements]?: number }
  ) {
    const elements = Object.keys(dmgPerElement).filter(
      (element) => element !== Elements.HEALTH && element !== Elements.NONE
    )
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
          this.game.enemy.sprite.x,
          this.game.enemy.sprite.y,
          `#${Constants.ELEMENT_TO_COLOR[element]}`,
          hasElementAdv ? '30px' : hasElementDisadv ? '20px' : '25px'
        )
        this.game.enemy.damage(dmgPerElement[element])
        this.playAttackAnimation(index + 1, dmgPerElement)
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
