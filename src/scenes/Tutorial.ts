import { TutorialBoard } from '~/core/TutorialBoard'
import { Constants, Elements } from '~/utils/Constants'
import { Game } from './Game'
import { TutorialPlayer } from '~/core/TutorialPlayer'
import { TutorialEnemy } from '~/core/TutorialEnemy'
import { Button } from '~/core/Button'

export enum TutorialPhase {
  BASIC_ORB_MOVEMENT = 'BASIC_ORB_MOVEMENT',
  ORB_COLOR = 'ORB_COLOR',
  ENEMY_ATTACK = 'ENEMY_ATTACK',
}

export class Tutorial extends Phaser.Scene {
  private static TUTORIAL_ENEMY_CONFIG = {
    maxHealth: 50,
    spriteName: 'green-dragon',
    element: Elements.GRASS,
    baseDamage: 10,
    maxTurnsUntilAttack: 4,
  }
  private static ALL_TEXT_LINES = [
    [
      "Let's take a minute to learn how to play. To attack the enemy, drag scales around, matching 3 or more to create combos",
      'Moving an orb will cause other orbs to shift around as well. Use that to your advantage to string together multiple combos',
      'Pay attention to the green bar above the orb you drag, as that indicates the time limit you have to move',
    ],
    [
      'Notice that scales have colors. Some of these correspond to the elements (red: fire, blue: water, green: grass, purple: darkness, and yellow: light).',
      'Whereas elemental scales deal damage, heal scales (pink) recover HP',
      'The gray scales are not associated with any element, but do contribute to combo multipliers',
      'As you defeat enemies, you will unlock new scales which will replace the gray scales',
      'Every enemy you encounter will be color coded to the element associated with it, which determine its weaknesses and resistances',
      'As you can probably guess, water, fire and grass behave like the classic rock-paper-scissors trio. (Water > fire, fire > grass, grass > water)',
      'Light, on the other hand, is strong against dark and vice versa. Dark resists all elements except light',
      'This particular enemy is a grass type. Try matching some fire scales against it to deal maximum damage!',
    ],
    [
      'Nicely done!',
      "One more thing - enemies will fight back! The time until the enemy's next attack will be displayed above it.",
      "Pay attention to the enemy's attack countdown as it won't always be the same. Use that to plan your combos accordingly.",
      'Defeat this enemy and start your journey towards becoming King of the Dragons!',
    ],
  ]

  private currTutorialPhase = TutorialPhase.BASIC_ORB_MOVEMENT

  private board!: TutorialBoard
  private player!: TutorialPlayer
  private enemy!: TutorialEnemy

  private tutorialText!: Phaser.GameObjects.Text
  private tutorialTextBox!: Phaser.GameObjects.Rectangle
  private continueButtonText!: Phaser.GameObjects.Text

  private tutorialTextBlockIndex: number = 0
  private tutorialTextLineIndex: number = 0

  private transitionOverlayRect!: Phaser.GameObjects.Rectangle
  private transitionTitleText!: Phaser.GameObjects.Text
  private transitionSubtitleText!: Phaser.GameObjects.Text
  private continueButton!: Button

  constructor() {
    super('tutorial')
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
        Constants.WINDOW_HEIGHT / 2,
        'Tutorial Complete!',
        {
          fontSize: '35px',
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
        this.continueButton.setVisible(false)
        this.game.scene.start('game', { level: 0 })
        this.tutorialTextBlockIndex = 0
        this.tutorialTextLineIndex = 0
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
    this.continueButton.setVisible(false)
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
        this.transitionTitleText.setVisible(true)
        this.continueButton.setVisible(true)
      },
    })
  }

  setupTutorialText() {
    this.tutorialText = this.add
      .text(30, Constants.WINDOW_HEIGHT - 150, '', {
        fontSize: '20px',
        color: 'white',
      })
      .setWordWrapWidth(Constants.WINDOW_WIDTH - 60)
      .setDepth(Constants.SORT_ORDER.top)
      .setOrigin(0, 0)
    this.tutorialTextBox = this.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2,
        this.tutorialText.y - 30,
        Constants.WINDOW_WIDTH,
        300,
        0x000000
      )
      .setAlpha(0.5)
      .setOrigin(0.5, 0)
      .setDepth(this.tutorialText.depth - 1)

    this.continueButtonText = this.add
      .text(
        Constants.WINDOW_WIDTH - 30,
        Constants.WINDOW_HEIGHT - 15,
        'Continue',
        {
          fontSize: '20px',
          color: 'white',
        }
      )
      .setOrigin(1, 1)
      .setStroke('white', 1)
      .setInteractive({ cursor: 'pointer' })
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.goToNextTutorialLine()
      })
      .setDepth(Constants.SORT_ORDER.top)
    this.displayTutorialText()
  }

  goToNextTutorialTextBlock() {}

  goToNextTutorialLine() {
    this.tutorialTextLineIndex++
    const currTutorialTextBlock =
      Tutorial.ALL_TEXT_LINES[this.tutorialTextBlockIndex]
    if (this.tutorialTextLineIndex === currTutorialTextBlock.length) {
      this.tutorialTextLineIndex = 0
      // Handle demo portion at the end of explanation text here
      this.handleTutorialBlockTransition()
    }
    this.displayTutorialText()
  }

  handleTutorialBlockTransition() {
    this.tutorialTextBlockIndex++
    switch (this.currTutorialPhase) {
      case TutorialPhase.BASIC_ORB_MOVEMENT: {
        this.tutorialText.setVisible(false)
        this.tutorialTextBox.setVisible(false)
        this.continueButtonText.setVisible(false)
        this.board.demoOrbMovement(
          {
            row: 1,
            col: 2,
          },
          [
            {
              row: 1,
              col: 3,
            },
            {
              row: 1,
              col: 4,
            },
            {
              row: 2,
              col: 4,
            },
            {
              row: 2,
              col: 5,
            },
          ],
          500
        )
        break
      }
      case TutorialPhase.ORB_COLOR: {
        this.tutorialText.setVisible(false)
        this.tutorialTextBox.setVisible(false)
        this.continueButtonText.setVisible(false)
        this.board.setDisabled(false)
        break
      }
      case TutorialPhase.ENEMY_ATTACK: {
        this.enemy.toggleInvulnerable(false)
        this.enemy.toggleNextMoveText(true)
        this.player.addTurnEndListener(() => {
          this.time.delayedCall(500, () => {
            this.enemy.takeTurn()
          })
        })
        this.enemy.addAttackListener((dmgAmount) =>
          this.player.damage(dmgAmount)
        )
        this.enemy.addTurnEndListener(() => this.board.setDisabled(false))
        this.enemy.addOnDiedListener(() => {
          this.displayTransitionOverlay()
        })
        this.tutorialText.setVisible(false)
        this.tutorialTextBox.setVisible(false)
        this.continueButtonText.setVisible(false)
        this.board.setDisabled(false)
        break
      }
    }
  }

  handlePlayerTurnEnd() {
    switch (this.currTutorialPhase) {
      case TutorialPhase.BASIC_ORB_MOVEMENT: {
        this.currTutorialPhase = TutorialPhase.ORB_COLOR
        this.tutorialText.setVisible(true)
        this.tutorialTextBox.setVisible(true)
        this.continueButtonText.setVisible(true)
        break
      }
      case TutorialPhase.ORB_COLOR: {
        this.currTutorialPhase = TutorialPhase.ENEMY_ATTACK
        this.tutorialText.setVisible(true)
        this.tutorialTextBox.setVisible(true)
        this.continueButtonText.setVisible(true)
        break
      }
    }
  }

  displayTutorialText() {
    if (this.tutorialTextBlockIndex < Tutorial.ALL_TEXT_LINES.length) {
      const currTutorialTextBlock =
        Tutorial.ALL_TEXT_LINES[this.tutorialTextBlockIndex]

      if (this.tutorialTextLineIndex < currTutorialTextBlock.length) {
        const currTutorialTextLine =
          currTutorialTextBlock[this.tutorialTextLineIndex]
        this.tutorialText.setText(currTutorialTextLine)
      }
    }
  }

  create() {
    this.sound.stopAll()
    this.sound.play('tutorial', { volume: 0.25, loop: true })
    this.cameras.main.setBackgroundColor(0x369f5c)
    this.board = new TutorialBoard(this)
    this.board.setDisabled(true)

    this.player = new TutorialPlayer(this as unknown as Game, this.board)
    this.player.addTurnEndListener(() => {
      this.handlePlayerTurnEnd()
    })

    this.enemy = new TutorialEnemy(
      this as unknown as Game,
      Tutorial.TUTORIAL_ENEMY_CONFIG
    )
    this.enemy.toggleInvulnerable(true)

    this.add
      .image(0, 0, 'background')
      .setDisplaySize(Constants.WINDOW_WIDTH, 375)
      .setOrigin(0, 0)
    this.setupTutorialText()
    this.createTransitionOverlay()
  }
}
