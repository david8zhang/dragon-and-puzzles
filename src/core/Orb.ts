import { Game } from '~/scenes/Game'
import { Board } from './Board'

export interface OrbConfig {
  id: string
  position: {
    x: number
    y: number
  }
  radius: number
  color: string
  board: Board
  currCell?: {
    row: number
    col: number
  }
}

export class Orb {
  public id: string
  private scene: Game
  private board: Board
  public color: string
  public sprite: Phaser.GameObjects.Sprite
  public currCell: {
    row: number
    col: number
  }

  constructor(scene: Game, config: OrbConfig) {
    this.id = config.id
    this.scene = scene
    this.board = config.board
    this.color = config.color
    this.sprite = this.scene.add
      .sprite(config.position.x, config.position.y, `orb-${config.color}`)
      .setOrigin(0.5, 0.5)
      .setScale(2)
      .setInteractive()

    if (config.currCell) {
      this.currCell = config.currCell
    } else {
      this.currCell = this.board.getRowColForWorldPosition(
        config.position.x,
        config.position.y
      )
    }
    this.scene.input.setDraggable(this.sprite)
    this.sprite.on('drag', (e) => {
      if (!this.board.isInteractable()) return
      this.handleDragStart(e.worldX, e.worldY)
    })
    this.sprite.on('dragend', (e) => {
      if (!this.board.isInteractable()) return
      this.handleDragEnd(e.worldX, e.worldY)
    })
  }

  handleDragStart(worldX: number, worldY: number) {
    const clampedPos = this.board.clampWithinBounds(worldX, worldY)
    this.sprite.setPosition(clampedPos.worldX, clampedPos.worldY)
    const newCell = this.board.getRowColForWorldPosition(
      clampedPos.worldX,
      clampedPos.worldY
    )
    if (
      newCell.row !== this.currCell.row ||
      newCell.col !== this.currCell.col
    ) {
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
