import { Scene } from 'phaser'
import { Board, BoardPosition } from './Board'
import { Constants, Elements } from '~/utils/Constants'
import { Orb } from './Orb'

export class TutorialBoard extends Board {
  private static BOARD_CONFIG = [
    [
      Elements.WATER,
      Elements.HEALTH,
      Elements.FIRE,
      Elements.LIGHT,
      Elements.HEALTH,
      Elements.FIRE,
    ],
    [
      Elements.HEALTH,
      Elements.DARK,
      Elements.WATER,
      Elements.FIRE,
      Elements.FIRE,
      Elements.GRASS,
    ],
    [
      Elements.GRASS,
      Elements.HEALTH,
      Elements.FIRE,
      Elements.LIGHT,
      Elements.HEALTH,
      Elements.HEALTH,
    ],
    [
      Elements.FIRE,
      Elements.DARK,
      Elements.HEALTH,
      Elements.WATER,
      Elements.HEALTH,
      Elements.FIRE,
    ],
    [
      Elements.GRASS,
      Elements.FIRE,
      Elements.HEALTH,
      Elements.FIRE,
      Elements.WATER,
      Elements.HEALTH,
    ],
  ]

  private spawnRandomOrbs: boolean = false
  private pointerSprite: Phaser.GameObjects.Sprite

  constructor(scene: Scene) {
    super(scene)
    this.pointerSprite = this.scene.add
      .sprite(0, 0, 'pointer')
      .setDepth(Constants.SORT_ORDER.top)
      .setVisible(false)
      .setScale(2)
  }

  setupBoard() {
    let xPos = Board.GRID_TOP_LEFT_X
    let yPos = Board.GRID_TOP_LEFT_Y
    const elementsForLevel = this.getElementsForLevel()
    for (let i = 0; i < TutorialBoard.BOARD_CONFIG.length; i++) {
      const orbRow: Orb[] = []
      const gridRow: Phaser.Geom.Rectangle[] = []
      xPos = Board.GRID_TOP_LEFT_X
      for (let j = 0; j < TutorialBoard.BOARD_CONFIG[i].length; j++) {
        const cell = new Phaser.Geom.Rectangle(
          xPos,
          yPos,
          Board.CELL_SIZE,
          Board.CELL_SIZE
        )
        const boardPanel = this.scene.add
          .rectangle(
            xPos,
            yPos,
            Board.CELL_SIZE,
            Board.CELL_SIZE,
            (i + j) % 2 == 0 ? 0x888888 : 0x444444
          )
          .setOrigin(0, 0)
          .setAlpha(0.5)
          .setDepth(Constants.SORT_ORDER.background)
          .setStrokeStyle(2, 0x222222)

        this.boardPanels.add(boardPanel)

        const orb = new Orb(this.scene, {
          id: Phaser.Utils.String.UUID(),
          position: {
            x: cell.centerX,
            y: cell.centerY,
          },
          radius: Board.CELL_SIZE / 2 - 10,
          element: TutorialBoard.BOARD_CONFIG[i][j],
          isDeactivated: !elementsForLevel.includes(
            TutorialBoard.BOARD_CONFIG[i][j]
          ),
          board: this,
        })
        orbRow[j] = orb
        gridRow[j] = cell
        xPos += Board.CELL_SIZE
      }
      yPos += Board.CELL_SIZE
      this.orbs[i] = orbRow
      this.grid[i] = gridRow
    }
  }

  toggleSpawnRandomOrbs(spawnRandomOrbs: boolean) {
    this.spawnRandomOrbs = spawnRandomOrbs
  }

  getElementsForLevel() {
    return [Elements.HEALTH, Elements.FIRE, Elements.NONE]
  }

  demoOrbMovement(
    initialPosition: BoardPosition,
    path: BoardPosition[],
    duration: number
  ) {
    this.overlay.fillAlpha = 0.0

    const orbAtInitialPos = this.getOrbAtRowCol(
      initialPosition.row,
      initialPosition.col
    )!
    this.pointerSprite
      .setPosition(orbAtInitialPos.sprite.x, orbAtInitialPos.sprite.y)
      .setVisible(true)
      .setOrigin(0)

    const moveOrbAlongPath = (pathIndex: number) => {
      if (pathIndex == path.length) {
        this.pointerSprite.setVisible(false)
        orbAtInitialPos.handleDragEnd(
          orbAtInitialPos.sprite.x,
          orbAtInitialPos.sprite.y
        )
        return
      }
      const nextPosition = path[pathIndex]
      const nextPosCell = this.getCellAtRowCol(
        nextPosition.row,
        nextPosition.col
      )!
      this.scene.tweens.add({
        targets: [orbAtInitialPos.sprite, this.pointerSprite],
        duration,
        x: {
          from: orbAtInitialPos.sprite.x,
          to: nextPosCell.centerX,
        },
        y: {
          from: orbAtInitialPos.sprite.y,
          to: nextPosCell.centerY,
        },
        onUpdate: (a, b) => {
          orbAtInitialPos.handleDragStart(b.x, b.y)
        },
        onComplete: () => {
          moveOrbAlongPath(pathIndex + 1)
        },
      })
    }
    moveOrbAlongPath(0)
  }

  generateOrbsToFillEmptySlots(allEmptySlots: BoardPosition[][]) {
    let timeUntilLastOrbFalls = 0

    const elementsForLevel = this.getElementsForLevel()
    const lockedElements = Constants.ALL_ELEMENTS.filter(
      (element) => !elementsForLevel.includes(element)
    )

    allEmptySlots.forEach((column) => {
      let yPos = Board.GRID_TOP_LEFT_Y - 25
      column.forEach((slot) => {
        const worldPosForRowCol = this.getCellAtRowCol(slot.row, slot.col)
        let randomElement = Phaser.Utils.Array.GetRandom(
          this.getElementsForLevel()
        )
        if (randomElement === Elements.NONE) {
          randomElement = Phaser.Utils.Array.GetRandom(lockedElements)
        }
        const newOrb = new Orb(this.scene, {
          position: {
            x: worldPosForRowCol!.centerX,
            y: yPos,
          },
          id: Phaser.Utils.String.UUID(),
          radius: Board.CELL_SIZE / 2 - 10,
          element: randomElement,
          isDeactivated: !elementsForLevel.includes(randomElement),
          board: this,
          currCell: {
            row: slot.row,
            col: slot.col,
          },
        })
        this.orbs[slot.row][slot.col] = newOrb
        const fallSpeed = 0.25
        const distance = worldPosForRowCol!.centerY - yPos
        newOrb.sprite.setVisible(false)
        const onCompleteCallback = () => {
          this.moveOrbToNewLocation(slot.row, slot.col, newOrb)
        }
        const fallDuration = distance / fallSpeed
        timeUntilLastOrbFalls = Math.max(fallDuration, timeUntilLastOrbFalls)
        this.scene.tweens.add({
          targets: [newOrb.sprite],
          y: {
            from: yPos,
            to: worldPosForRowCol!.centerY,
          },
          duration: fallDuration,
          onUpdate: () => {
            if (newOrb.sprite.y >= Board.GRID_TOP_LEFT_Y) {
              newOrb.sprite.setVisible(true)
            }
          },
          onComplete: () => {
            onCompleteCallback()
          },
        })
        yPos -= Board.CELL_SIZE - 20
      })
    })
    this.scene.time.delayedCall(timeUntilLastOrbFalls, () => {
      this.handleCombos()
    })
  }
}
