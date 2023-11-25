import Phaser from 'phaser'
import { BattleUI } from '~/core/BattleUI'
import { Board } from '~/core/Board'
import { Button } from '~/core/Button'
import { ENEMIES, Enemy } from '~/core/Enemy'
import { Player } from '~/core/Player'
import { RainbowDragonEnemy } from '~/core/RainbowDragonEnemy'
import { Constants } from '~/utils/Constants'

export class Game extends Phaser.Scene {
  public board!: Board
  public level: number = 1
  public player!: Player
  public enemy!: Enemy
  public playerSideMask: Phaser.Display.Masks.BitmapMask
  public enemySideMask: Phaser.Display.Masks.BitmapMask

  private transitionOverlayRect!: Phaser.GameObjects.Rectangle
  private transitionTitleText!: Phaser.GameObjects.Text
  private transitionOrbUnlocked!: Phaser.GameObjects.Sprite
  private transitionSubtitleText!: Phaser.GameObjects.Text
  private continueButton!: Button

  public cameraGrayscaleFilter: any
  public grayscalePlugin: any

  constructor() {
    super('game')
  }

  init(data): void {
    if (data.level !== undefined) {
      this.level = data.level
    }
  }

  initPlugins() {
    this.grayscalePlugin = this.plugins.get('rexGrayscalePipeline')
  }

  create() {
    this.initPlugins()

    const battleUI = new BattleUI(this)
    this.playerSideMask = battleUI.playerSideMask
    this.enemySideMask = battleUI.enemySideMask

    if (this.level < 4) {
      this.sound.stopAll()

      if (this.level < 2) {
        this.sound.play('level', { loop: true, volume: 0.25 })
      } else {
        this.sound.play('level-2', { loop: true, volume: 0.25 })
      }
    }
    this.cameras.main.setBackgroundColor(0x000000)
    this.board = new Board(this)

    this.player = new Player(this, this.board)
    // if (this.level == 0) {
    if (this.level >= ENEMIES.length) {
      this.enemy = new RainbowDragonEnemy(this, RainbowDragonEnemy.CONFIG)
    } else {
      this.enemy = new Enemy(this, ENEMIES[this.level])
    }

    this.player.addTurnEndListener(() => {
      this.time.delayedCall(500, () => {
        this.enemy.takeTurn()
      })
    })

    this.enemy.addAttackListener((dmgAmount) => this.player.damage(dmgAmount))
    this.enemy.addTurnEndListener(() => this.board.setDisabled(false))

    this.enemy.addOnDiedListener(() => {
      this.transitionToNextEnemy()
    })
    this.createTransitionOverlay()
  }

  createTransitionOverlay() {
    this.transitionOverlayRect = this.add
      .rectangle(
        0,
        0,
        Constants.WINDOW_WIDTH,
        Constants.WINDOW_HEIGHT,
        0x000000
      )
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.top)
    this.transitionTitleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 3,
        'Dragon Defeated!',
        {
          fontSize: '35px',
          color: 'white',
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(Constants.SORT_ORDER.top)
    this.transitionOrbUnlocked = this.add
      .sprite(
        Constants.WINDOW_WIDTH / 2,
        this.transitionTitleText.y +
          this.transitionTitleText.displayHeight +
          50,
        'orb-grass'
      )
      .setDepth(Constants.SORT_ORDER.top)
      .setScale(2)
    this.transitionSubtitleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        this.transitionOrbUnlocked.y +
          this.transitionOrbUnlocked.displayHeight +
          30,
        'Grass scale obtained!',
        {
          fontSize: '25px',
          color: 'white',
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(Constants.SORT_ORDER.top)
    this.continueButton = new Button({
      scene: this,
      width: 200,
      height: 50,
      text: 'Continue',
      onClick: () => {
        this.transitionOverlayRect.setVisible(false)
        this.transitionTitleText.setVisible(false)
        this.transitionSubtitleText.setVisible(false)
        this.continueButton.setVisible(false)
        this.transitionOrbUnlocked.setVisible(false)
        if (this.level === ENEMIES.length - 2) {
          this.game.scene.start('victory', { isPreBoss: true })
        } else {
          this.game.scene.start('game', { level: this.level + 1 })
        }
      },
      x: Constants.WINDOW_WIDTH / 2,
      y: Constants.WINDOW_HEIGHT - 100,
      depth: Constants.SORT_ORDER.top,
      backgroundColor: 0xffffff,
      textColor: 'black',
      fontSize: '20px',
    })

    this.transitionOverlayRect.setVisible(false)
    this.transitionTitleText.setVisible(false)
    this.transitionSubtitleText.setVisible(false)
    this.continueButton.setVisible(false)
    this.transitionOrbUnlocked.setVisible(false)
  }

  displayTransitionOverlay() {
    this.sound.stopAll()
    this.sound.play('level-victory', { volume: 0.25 })
    this.transitionOverlayRect.setVisible(true).setAlpha(0)
    this.tweens.add({
      targets: [this.transitionOverlayRect],
      alpha: {
        from: 0,
        to: 0.8,
      },
      duration: 500,
      ease: Phaser.Math.Easing.Sine.Out,
      onComplete: () => {
        const enemyDefeated = ENEMIES[this.level]
        const elementUnlocked = enemyDefeated.element

        this.transitionSubtitleText.setText(
          `${Phaser.Utils.String.UppercaseFirst(
            elementUnlocked
          )} scale obtained!`
        )
        this.transitionOrbUnlocked.setTexture(`orb-${elementUnlocked}`)

        this.transitionTitleText.setVisible(true)
        this.transitionSubtitleText.setVisible(true)
        this.continueButton.setVisible(true)
        this.transitionOrbUnlocked.setVisible(true)
      },
    })
  }

  transitionToNextEnemy() {
    if (this.level === ENEMIES.length - 1) {
      this.game.scene.start('victory', { isPreBoss: false })
    } else {
      this.displayTransitionOverlay()
    }
  }
}
