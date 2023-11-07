import { Constants } from '~/utils/Constants'
import { Orb } from './Orb'
import { Game } from '~/scenes/Game'

export interface BoardPosition {
  row: number
  col: number
}

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
    let orbId: number = 0
    for (let i = 0; i < Board.BOARD_HEIGHT; i++) {
      const orbRow: Orb[] = []
      const gridRow: Phaser.Geom.Rectangle[] = []
      xPos = Board.GRID_TOP_LEFT_X
      for (let j = 0; j < Board.BOARD_WIDTH; j++) {
        const cell = new Phaser.Geom.Rectangle(xPos, yPos, Board.CELL_SIZE, Board.CELL_SIZE)
        const orb = new Orb(this.scene, {
          id: orbId,
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
        orbId++
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
    // Check for all horizontal 3+ matches
    const horizontalCombos: number[][] = []
    let longestHorizCombo: number[] = []
    for (let row = 0; row < Board.BOARD_HEIGHT; row++) {
      const orbsInRow = this.orbs[row]
      let prevOrb = orbsInRow[0]
      longestHorizCombo = [prevOrb.id]
      for (let i = 1; i < orbsInRow.length; i++) {
        const orb = orbsInRow[i]
        if (orb.sprite.fillColor == prevOrb.sprite.fillColor) {
          longestHorizCombo.push(orb.id)
        } else {
          if (longestHorizCombo.length >= 3) {
            horizontalCombos.push([...longestHorizCombo])
          }
          longestHorizCombo = [orb.id]
        }
        prevOrb = orb
      }
      if (longestHorizCombo.length >= 3) {
        horizontalCombos.push([...longestHorizCombo])
      }
    }

    // Check for all vertical 3+ matches
    const verticalCombos: number[][] = []
    let longestVerticalCombo: number[] = []
    for (let i = 0; i < this.orbs[0].length; i++) {
      let prevOrb: Orb | null = null
      for (let j = 0; j < this.orbs.length; j++) {
        const currOrb = this.orbs[j][i]
        if (!prevOrb) {
          prevOrb = currOrb
          longestVerticalCombo = [prevOrb.id]
        } else {
          if (prevOrb.sprite.fillColor == currOrb.sprite.fillColor) {
            longestVerticalCombo.push(currOrb.id)
          } else {
            if (longestVerticalCombo.length >= 3) {
              verticalCombos.push([...longestVerticalCombo])
            }
            longestVerticalCombo = [currOrb.id]
          }
          prevOrb = currOrb
        }
      }
      if (longestVerticalCombo.length >= 3) {
        verticalCombos.push([...longestVerticalCombo])
      }
    }
    const joinedCombos = this.joinCombos(horizontalCombos, verticalCombos)
    const orbIdToOrbMapping = {}
    for (let i = 0; i < this.orbs.length; i++) {
      for (let j = 0; j < this.orbs[i].length; j++) {
        const orb = this.orbs[i][j]
        orbIdToOrbMapping[orb.id] = orb
      }
    }

    joinedCombos.forEach((combo) => {
      combo.forEach((orbId) => {
        orbIdToOrbMapping[orbId].sprite.setAlpha(0.3)
      })
    })
  }

  joinCombos(horizontalCombos: number[][], verticalCombos: number[][]): number[][] {
    // Join horizontal and vertical combos together using union find
    const parentArr = new Array(Board.BOARD_WIDTH * Board.BOARD_HEIGHT)
      .fill(0)
      .map((value, index) => index)
    const rank = new Array(Board.BOARD_WIDTH * Board.BOARD_HEIGHT).fill(1)

    var adjList: number[][] = []
    horizontalCombos.forEach((hCombo) => {
      for (let i = 0; i < hCombo.length - 1; i++) {
        adjList.push([hCombo[i], hCombo[i + 1]])
      }
    })
    verticalCombos.forEach((vCombo) => {
      for (let i = 0; i < vCombo.length - 1; i++) {
        adjList.push([vCombo[i], vCombo[i + 1]])
      }
    })

    const find = (orbId: number) => {
      let res = orbId
      while (res != parentArr[res]) {
        parentArr[res] = parentArr[parentArr[res]]
        res = parentArr[res]
      }
      return res
    }

    const union = (orbA: number, orbB: number) => {
      const parentA = find(orbA)
      const parentB = find(orbB)
      if (parentA == parentB) {
        return
      }
      if (rank[parentA] > rank[parentB]) {
        parentArr[parentB] = parentA
        rank[parentA] += rank[parentB]
      } else {
        parentArr[parentA] = parentB
        rank[parentB] += rank[parentA]
      }
    }

    adjList.forEach((edge) => {
      union(edge[0], edge[1])
    })

    const comboMapping = {}
    parentArr.forEach((parent, index) => {
      if (parent != index) {
        if (!comboMapping[parent]) {
          comboMapping[parent] = [parent]
        }
        comboMapping[parent].push(index)
      }
    })
    return Object.values(comboMapping)
  }
}
