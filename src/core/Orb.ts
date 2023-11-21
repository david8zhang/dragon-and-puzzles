import { Board } from './Board'
import { Constants } from '~/utils/Constants'
import { Scene } from 'phaser'

export interface OrbConfig {
  id: string
  position: {
    x: number
    y: number
  }
  radius: number
  element: string
  board: Board
  currCell?: {
    row: number
    col: number
  }
}

export class Orb {
  private scene: Scene
  private board: Board
  private updateTimerBarEvent!: Phaser.Time.TimerEvent
  private timerBar!: Phaser.GameObjects.Rectangle

  public id: string
  public element: string
  public sprite: Phaser.GameObjects.Sprite
  public currCell: {
    row: number
    col: number
  }
  public timerStarted: boolean = false
  private timerEnabled: boolean = true

  constructor(scene: Scene, config: OrbConfig) {
    this.id = config.id
    this.scene = scene
    this.board = config.board
    this.element = config.element

    this.sprite = this.scene.add
      .sprite(config.position.x, config.position.y, `orb-${config.element}`)
      .setOrigin(0.5, 0.5)
      .setScale(2)
      .setDepth(Constants.SORT_ORDER.ui)
      .setInteractive()

    if (config.currCell) {
      this.currCell = config.currCell
    } else {
      this.currCell = this.board.getRowColForWorldPosition(
        config.position.x,
        config.position.y
      )
    }
    this.timerBar = this.scene.add
      .rectangle(
        this.sprite.x - this.sprite.displayWidth / 2,
        this.sprite.y - this.sprite.displayHeight / 2 - 10,
        this.sprite.displayWidth,
        4,
        0x00ff00
      )
      .setOrigin(0, 0)
      .setDepth(Constants.SORT_ORDER.top)
      .setVisible(false)
    this.scene.input.setDraggable(this.sprite)
    this.sprite.on('drag', (e) => {
      if (!this.board.isInteractable()) return
      this.sprite.setDepth(Constants.SORT_ORDER.ui)
      this.handleDragStart(e.worldX, e.worldY)
    })
    this.sprite.on('dragend', (e) => {
      if (!this.board.isInteractable()) return
      this.timerStarted = false
      this.sprite.setDepth(Constants.SORT_ORDER.ui)
      this.handleDragEnd(e.worldX, e.worldY)
    })
  }

  toggleMoveTimer(timerEnabled: boolean) {
    this.timerEnabled = timerEnabled
  }

  handleDragStart(worldX: number, worldY: number) {
    const clampedPos = this.board.clampWithinBounds(worldX, worldY)
    this.sprite.setPosition(clampedPos.worldX, clampedPos.worldY)
    const newCell = this.board.getRowColForWorldPosition(
      clampedPos.worldX,
      clampedPos.worldY
    )

    if (this.timerEnabled) {
      if (!this.timerStarted) {
        this.timerStarted = true
        let timeElapsed = 0
        const totalTime = Constants.MOVE_TIME_LIMIT * 10

        this.updateTimerBarEvent = this.scene.time.addEvent({
          repeat: totalTime,
          delay: 100,
          callback: () => {
            timeElapsed++
            const pctWidth = (totalTime - timeElapsed) / totalTime

            if (pctWidth == 0) {
              this.updateTimerBarEvent.remove()
              this.handleDragEnd(this.sprite.x, this.sprite.y)
            } else {
              this.timerBar.setDisplaySize(
                pctWidth * this.sprite.displayWidth,
                4
              )

              if (pctWidth < 0.25) {
                this.timerBar.setFillStyle(0xff0000)
              } else if (pctWidth < 0.5) {
                this.timerBar.setFillStyle(0xf1c40f)
              }
            }
          },
        })
      }
      this.timerBar
        .setVisible(true)
        .setPosition(
          this.sprite.x - this.sprite.displayWidth / 2,
          this.sprite.y - this.sprite.displayHeight / 2 - 10
        )
    }

    if (
      newCell.row !== this.currCell.row ||
      newCell.col !== this.currCell.col
    ) {
      this.scene.sound.play('orb-move')
      const orbAtNewLocation = this.board.getOrbAtRowCol(
        newCell.row,
        newCell.col
      )!
      this.board.moveOrbToNewLocation(
        this.currCell.row,
        this.currCell.col,
        orbAtNewLocation
      )
      this.currCell = newCell
    }
  }

  handleDragEnd(worldX: number, worldY: number) {
    if (this.updateTimerBarEvent) {
      this.updateTimerBarEvent.remove()
    }
    this.timerBar.setVisible(false)
    const clampedPos = this.board.clampWithinBounds(worldX, worldY)
    const cell = this.board.getCellForWorldPosition(
      clampedPos.worldX,
      clampedPos.worldY
    )
    const { row, col } = this.board.getRowColForWorldPosition(
      clampedPos.worldX,
      clampedPos.worldY
    )
    this.sprite.setPosition(cell.centerX, cell.centerY)
    this.board.moveOrbToNewLocation(row, col, this)
    this.board.handleCombos()
  }

  moveToNewLocation(row: number, col: number) {
    this.currCell = { row, col }
    const cell = this.board.getCellAtRowCol(row, col)
    this.sprite.setPosition(cell!.centerX, cell!.centerY)
  }

  destroy() {
    this.sprite.destroy()
    this.board
  }
}
