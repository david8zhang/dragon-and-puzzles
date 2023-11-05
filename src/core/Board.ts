import { Constants } from '~/utils/Constants'
import { Orb } from './Orb'
import { Game } from '~/scenes/Game'

export class Board {
  private static BOARD_WIDTH = 6
  private static BOARD_HEIGHT = 5
  private static CELL_SIZE = 75
  private static GRID_TOP_LEFT_X = 75
  private static GRID_TOP_LEFT_Y = 340

  private scene: Game
  private grid: Phaser.Geom.Rectangle[][] = []
  private orbs: Orb[][] = []
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Game) {
    this.scene = scene
    this.graphics = this.scene.add.graphics()
    this.graphics.lineStyle(1, 0x00ff00)
    this.setupGrid()
  }

  setupGrid() {
    let xPos = Board.GRID_TOP_LEFT_X
    let yPos = Board.GRID_TOP_LEFT_Y
    for (let i = 0; i < Board.BOARD_HEIGHT; i++) {
      const orbRow: Orb[] = []
      const gridRow: Phaser.Geom.Rectangle[] = []
      xPos = Board.GRID_TOP_LEFT_X
      for (let j = 0; j < Board.BOARD_WIDTH; j++) {
        const cell = new Phaser.Geom.Rectangle(xPos, yPos, Board.CELL_SIZE, Board.CELL_SIZE)
        const orb = new Orb(this.scene, {
          position: {
            x: cell.centerX,
            y: cell.centerY,
          },
          radius: Board.CELL_SIZE / 2 - 10,
          color: Phaser.Utils.Array.GetRandom(Constants.ORB_COLORS),
          board: this,
        })
        orbRow[j] = orb
        gridRow[j] = cell
        this.graphics.strokeRectShape(cell)
        xPos += Board.CELL_SIZE
      }
      yPos += Board.CELL_SIZE
      this.orbs[i] = orbRow
      this.grid[i] = gridRow
    }
  }

  getCellAtRowCol(row: number, col: number) {
    if (row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length) {
      return this.grid[row][col]
    }
  }

  moveOrbToNewLocation(row: number, col: number, orb: Orb) {
    this.orbs[row][col] = orb
    orb.moveToNewLocation(row, col)
  }

  getOrbAtRowCol(row: number, col: number) {
    if (row >= 0 && row < this.orbs.length && col >= 0 && col < this.orbs[0].length) {
      return this.orbs[row][col]
    }
  }

  getOrbAtWorldPosition(worldX: number, worldY: number) {
    const { row, col } = this.getRowColForWorldPosition(worldX, worldX)
    return this.orbs[row][col]
  }

  getRowColForWorldPosition(worldX: number, worldY: number) {
    const xFromStartOfGrid = worldX - Board.GRID_TOP_LEFT_X
    const yFromStartOfGrid = worldY - Board.GRID_TOP_LEFT_Y
    const cellRow = Math.floor(yFromStartOfGrid / Board.CELL_SIZE)
    const cellCol = Math.floor(xFromStartOfGrid / Board.CELL_SIZE)
    return {
      row: cellRow,
      col: cellCol,
    }
  }

  getCellForWorldPosition(worldX: number, worldY: number) {
    const { row, col } = this.getRowColForWorldPosition(worldX, worldY)
    return this.grid[row][col]
  }

  isPointWithinBounds(worldX: number, worldY: number): boolean {
    return (
      worldX >= Board.GRID_TOP_LEFT_X + 15 &&
      worldY >= Board.GRID_TOP_LEFT_Y + 15 &&
      worldX <= Board.GRID_TOP_LEFT_X + Board.BOARD_WIDTH * Board.CELL_SIZE - 15 &&
      worldY <= Board.GRID_TOP_LEFT_Y + Board.BOARD_HEIGHT * Board.CELL_SIZE - 15
    )
  }

  clampWithinBounds(worldX: number, worldY: number) {
    return {
      worldX: Math.min(
        Board.GRID_TOP_LEFT_X + Board.BOARD_WIDTH * Board.CELL_SIZE - 15,
        Math.max(Board.GRID_TOP_LEFT_X + 15, worldX)
      ),
      worldY: Math.min(
        Board.GRID_TOP_LEFT_Y + Board.BOARD_HEIGHT * Board.CELL_SIZE - 15,
        Math.max(Board.GRID_TOP_LEFT_Y + 15, worldY)
      ),
    }
  }

  handleCombos() {
    const orbsToRemove: { row: number; col: number }[][] = []

    // Check for all horizontal 3+ matches
    let longestHorizCombo: { row: number; col: number }[] = []
    for (let row = 0; row < Board.BOARD_HEIGHT; row++) {
      const orbsInRow = this.orbs[row]
      let prevOrb = orbsInRow[0]
      longestHorizCombo = [{ row, col: 0 }]
      for (let i = 1; i < orbsInRow.length; i++) {
        const orb = orbsInRow[i]
        if (orb.sprite.fillColor == prevOrb.sprite.fillColor) {
          longestHorizCombo.push({ row, col: i })
        } else {
          if (longestHorizCombo.length >= 3) {
            orbsToRemove.push([...longestHorizCombo])
          }
          longestHorizCombo = [{ row, col: i }]
        }
        prevOrb = orb
      }
      if (longestHorizCombo.length >= 3) {
        orbsToRemove.push([...longestHorizCombo])
      }
    }

    // Check for all vertical 3+ matches
    let longestVerticalCombo: { row: number; col: number }[] = []
    for (let i = 0; i < this.orbs[0].length; i++) {
      let prevOrb: Orb | null = null
      for (let j = 0; j < this.orbs.length; j++) {
        const currOrb = this.orbs[j][i]
        if (!prevOrb) {
          prevOrb = currOrb
          longestVerticalCombo = [{ row: j, col: i }]
        } else {
          if (prevOrb.sprite.fillColor == currOrb.sprite.fillColor) {
            longestVerticalCombo.push({ row: j, col: i })
          } else {
            if (longestVerticalCombo.length >= 3) {
              orbsToRemove.push([...longestVerticalCombo])
            }
            longestVerticalCombo = []
          }
        }
        prevOrb = currOrb
      }
      if (longestVerticalCombo.length >= 3) {
        orbsToRemove.push([...longestVerticalCombo])
      }
    }
  }
}
