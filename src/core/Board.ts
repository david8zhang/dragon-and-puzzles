import { Constants } from '~/utils/Constants';
import { Orb } from './Orb';
import { Game } from '~/scenes/Game';

export interface BoardPosition {
	row: number;
	col: number;
}

export class Board {
	private static BOARD_WIDTH = 6;
	private static BOARD_HEIGHT = 5;
	private static CELL_SIZE = 75;
	private static GRID_TOP_LEFT_X = 75;
	private static GRID_TOP_LEFT_Y = 340;

	private scene: Game;
	private grid: Phaser.Geom.Rectangle[][] = [];
	private orbs: (Orb | null)[][] = [];
	private graphics: Phaser.GameObjects.Graphics;

	private comboListener: Array<(combos: string[][]) => void> = [];

	constructor(scene: Game) {
		this.scene = scene;
		this.graphics = this.scene.add.graphics();
		this.graphics.lineStyle(1, 0x00ff00);
		this.setupGrid();
	}

	setupGrid() {
		let xPos = Board.GRID_TOP_LEFT_X;
		let yPos = Board.GRID_TOP_LEFT_Y;
		for (let i = 0; i < Board.BOARD_HEIGHT; i++) {
			const orbRow: Orb[] = [];
			const gridRow: Phaser.Geom.Rectangle[] = [];
			xPos = Board.GRID_TOP_LEFT_X;
			for (let j = 0; j < Board.BOARD_WIDTH; j++) {
				const cell = new Phaser.Geom.Rectangle(
					xPos,
					yPos,
					Board.CELL_SIZE,
					Board.CELL_SIZE
				);
				const orb = new Orb(this.scene, {
					id: Phaser.Utils.String.UUID(),
					position: {
						x: cell.centerX,
						y: cell.centerY,
					},
					radius: Board.CELL_SIZE / 2 - 10,
					color: Phaser.Utils.Array.GetRandom(Constants.ORB_COLORS),
					board: this,
				});
				orbRow[j] = orb;
				gridRow[j] = cell;
				this.graphics.strokeRectShape(cell);
				xPos += Board.CELL_SIZE;
			}
			yPos += Board.CELL_SIZE;
			this.orbs[i] = orbRow;
			this.grid[i] = gridRow;
		}
	}

	getCellAtRowCol(row: number, col: number) {
		if (
			row >= 0 &&
			row < this.grid.length &&
			col >= 0 &&
			col < this.grid[0].length
		) {
			return this.grid[row][col];
		}
	}

	moveOrbToNewLocation(row: number, col: number, orb: Orb) {
		this.orbs[row][col] = orb;
		orb.moveToNewLocation(row, col);
	}

	getOrbAtRowCol(row: number, col: number) {
		if (
			row >= 0 &&
			row < this.orbs.length &&
			col >= 0 &&
			col < this.orbs[0].length
		) {
			return this.orbs[row][col];
		}
	}

	getOrbAtWorldPosition(worldX: number, worldY: number) {
		const { row, col } = this.getRowColForWorldPosition(worldX, worldX);
		return this.orbs[row][col];
	}

	getRowColForWorldPosition(worldX: number, worldY: number) {
		const xFromStartOfGrid = worldX - Board.GRID_TOP_LEFT_X;
		const yFromStartOfGrid = worldY - Board.GRID_TOP_LEFT_Y;
		const cellRow = Math.floor(yFromStartOfGrid / Board.CELL_SIZE);
		const cellCol = Math.floor(xFromStartOfGrid / Board.CELL_SIZE);
		return {
			row: cellRow,
			col: cellCol,
		};
	}

	getCellForWorldPosition(worldX: number, worldY: number) {
		const { row, col } = this.getRowColForWorldPosition(worldX, worldY);
		return this.grid[row][col];
	}

	isPointWithinBounds(worldX: number, worldY: number): boolean {
		return (
			worldX >= Board.GRID_TOP_LEFT_X + 15 &&
			worldY >= Board.GRID_TOP_LEFT_Y + 15 &&
			worldX <=
				Board.GRID_TOP_LEFT_X + Board.BOARD_WIDTH * Board.CELL_SIZE - 15 &&
			worldY <=
				Board.GRID_TOP_LEFT_Y + Board.BOARD_HEIGHT * Board.CELL_SIZE - 15
		);
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
		};
	}

	handleCombos() {
		// Check for all horizontal 3+ matches
		const horizontalCombos: string[][] = [];
		let longestHorizCombo: string[] = [];
		for (let row = 0; row < Board.BOARD_HEIGHT; row++) {
			const orbsInRow = this.orbs[row];
			let prevOrb = orbsInRow[0];
			longestHorizCombo = [prevOrb!.id];
			for (let i = 1; i < orbsInRow.length; i++) {
				const orb = orbsInRow[i];
				if (orb!.sprite.fillColor == prevOrb!.sprite.fillColor) {
					longestHorizCombo.push(orb!.id);
				} else {
					if (longestHorizCombo.length >= 3) {
						horizontalCombos.push([...longestHorizCombo]);
					}
					longestHorizCombo = [orb!.id];
				}
				prevOrb = orb;
			}
			if (longestHorizCombo.length >= 3) {
				horizontalCombos.push([...longestHorizCombo]);
			}
		}

		// Check for all vertical 3+ matches
		const verticalCombos: string[][] = [];
		let longestVerticalCombo: string[] = [];
		for (let i = 0; i < this.orbs[0].length; i++) {
			let prevOrb: Orb | null = null;
			for (let j = 0; j < this.orbs.length; j++) {
				const currOrb = this.orbs[j][i];
				if (!prevOrb) {
					prevOrb = currOrb;
					longestVerticalCombo = [prevOrb!.id];
				} else {
					if (prevOrb.sprite.fillColor == currOrb!.sprite.fillColor) {
						longestVerticalCombo.push(currOrb!.id);
					} else {
						if (longestVerticalCombo.length >= 3) {
							verticalCombos.push([...longestVerticalCombo]);
						}
						longestVerticalCombo = [currOrb!.id];
					}
					prevOrb = currOrb;
				}
			}
			if (longestVerticalCombo.length >= 3) {
				verticalCombos.push([...longestVerticalCombo]);
			}
		}
		const joinedCombos = this.joinCombos(horizontalCombos, verticalCombos);

		if (joinedCombos.length > 0) {
			this.comboListener.forEach((fn) => fn(joinedCombos));
			// Remove combos from the board
			this.removeCombos(joinedCombos, () => {
				// Spawn new orbs or have other orbs fall to fill in empty columns
				this.handleEmptyColumns();
			});
		} else {
			console.log('Handle turn end!');
		}
	}

	handleEmptyColumns() {
		/**
		 * - For each column, you get something like:
		 *
		 *    o
		 *    o
		 *    x
		 *    x
		 *    o
		 *
		 * where the o's are orbs and x's are empty spaces. Rotating to a horizontal array makes it easier to think about:
		 *
		 * o o x x o
		 *
		 * we see that we need to process the array from right to left, keeping track of the right-most empty position
		 * and shifting orbs over whenever we see them.
		 *
		 * Store coordinates of empty slots in a queue, and every time we see an orb, we pop off the queue and shift the orb to that coord position. If there is nothing in the queue, then that orb is filling the rightmost space.
		 *
		 * Whenever we shift an orb over, that orb's position now becomes empty so its coordinate will need to be added to the queue as well.
		 *
		 * q: 1, 2
		 *
		 * 0 1 2 3 4
		 * x x o o o
		 *
		 * After this is done, we are left with a queue which contains all of the empty positions from right to left. This will be useful in the 2nd phase of the algorithm, which is spawning new orbs to fill in available space
		 *
		 *
		 * When we spawn in new orbs, it's simply a matter of iterating through the queue and creating a new orb for each given element, which corresponds to the empty space
		 */

		const allEmptySlots: BoardPosition[][] = [];
		for (let i = 0; i < this.orbs[0].length; i++) {
			const emptySlotQueue: BoardPosition[] = [];
			for (let j = this.orbs.length - 1; j >= 0; j--) {
				if (this.orbs[j][i] == null) {
					emptySlotQueue.push({ row: j, col: i });
				} else {
					const orb = this.orbs[j][i]!;
					if (emptySlotQueue.length > 0) {
						const lowestEmptySlot = emptySlotQueue.shift()!;
						this.moveOrbToNewLocation(
							lowestEmptySlot.row,
							lowestEmptySlot.col,
							orb
						);
						emptySlotQueue.push({ row: j, col: i });
					}
				}
			}
			allEmptySlots.push(emptySlotQueue);
		}

		if (allEmptySlots.length == 0) {
			this.handleCombos();
		}

		let timeUntilLastOrbFalls = 0;
		allEmptySlots.forEach((column, index) => {
			let yPos = Board.GRID_TOP_LEFT_Y - 25;
			column.forEach((slot, slotIndex) => {
				const worldPosForRowCol = this.getCellAtRowCol(slot.row, slot.col);
				const newOrb = new Orb(this.scene, {
					position: {
						x: worldPosForRowCol!.centerX,
						y: yPos,
					},
					id: Phaser.Utils.String.UUID(),
					radius: Board.CELL_SIZE / 2 - 10,
					color: Phaser.Utils.Array.GetRandom(Constants.ORB_COLORS),
					board: this,
					currCell: {
						row: slot.row,
						col: slot.col,
					},
				});
				this.orbs[slot.row][slot.col] = newOrb;
				const fallSpeed = 0.25;
				const distance = worldPosForRowCol!.centerY - yPos;
				newOrb.sprite.setVisible(false);
				const onCompleteCallback = () => {
					this.moveOrbToNewLocation(slot.row, slot.col, newOrb);
				};
				const fallDuration = distance / fallSpeed;
				timeUntilLastOrbFalls = Math.max(fallDuration, timeUntilLastOrbFalls);
				this.scene.tweens.add({
					targets: [newOrb.sprite],
					y: {
						from: yPos,
						to: worldPosForRowCol!.centerY,
					},
					duration: fallDuration,
					onUpdate: () => {
						if (newOrb.sprite.y >= Board.GRID_TOP_LEFT_Y) {
							newOrb.sprite.setVisible(true);
						}
					},
					onComplete: () => {
						onCompleteCallback();
					},
				});
				yPos -= Board.CELL_SIZE - 20;
			});
		});

		this.scene.time.delayedCall(timeUntilLastOrbFalls, () => {
			this.handleCombos();
		});
	}

	removeCombos(combos: string[][], onOrbsRemovedCb: Function) {
		const orbIdToOrbMapping = {};
		for (let i = 0; i < this.orbs.length; i++) {
			for (let j = 0; j < this.orbs[i].length; j++) {
				const orb = this.orbs[i][j];
				orbIdToOrbMapping[orb!.id] = orb;
			}
		}
		const removeOrbs = (comboToRemoveIndex: number) => {
			if (comboToRemoveIndex === combos.length) {
				onOrbsRemovedCb();
				return;
			}
			const orbs: Orb[] = combos[comboToRemoveIndex].map(
				(orbId) => orbIdToOrbMapping[orbId]
			);
			const orbSprites = orbs.map((orb: Orb) => orb.sprite);
			this.scene.tweens.add({
				duration: 500,
				targets: orbSprites,
				alpha: {
					from: 1,
					to: 0,
				},
				onComplete: () => {
					orbs.forEach((orb) => {
						const rowCol = orb.currCell;
						this.orbs[rowCol.row][rowCol.col] = null;
						orb.destroy();
					});
					removeOrbs(comboToRemoveIndex + 1);
				},
			});
		};
		removeOrbs(0);
	}

	joinCombos(
		horizontalCombos: string[][],
		verticalCombos: string[][]
	): string[][] {
		// Join horizontal and vertical combos together using union find
		const parentArr = {};
		const rank = {};

		for (let i = 0; i < this.orbs.length; i++) {
			for (let j = 0; j < this.orbs[i].length; j++) {
				const orb = this.orbs[i][j] as Orb;
				parentArr[orb.id] = orb.id;
				rank[orb.id] = 1;
			}
		}

		var adjList: string[][] = [];
		horizontalCombos.forEach((hCombo) => {
			for (let i = 0; i < hCombo.length - 1; i++) {
				adjList.push([hCombo[i], hCombo[i + 1]]);
			}
		});
		verticalCombos.forEach((vCombo) => {
			for (let i = 0; i < vCombo.length - 1; i++) {
				adjList.push([vCombo[i], vCombo[i + 1]]);
			}
		});

		const find = (orbId: string) => {
			let res = orbId;
			while (res != parentArr[res]) {
				parentArr[res] = parentArr[parentArr[res]];
				res = parentArr[res];
			}
			return res;
		};

		const union = (orbA: string, orbB: string) => {
			const parentA = find(orbA);
			const parentB = find(orbB);
			if (parentA == parentB) {
				return;
			}
			if (rank[parentA] > rank[parentB]) {
				parentArr[parentB] = parentA;
				rank[parentA] += rank[parentB];
			} else {
				parentArr[parentA] = parentB;
				rank[parentB] += rank[parentA];
			}
		};

		adjList.forEach((edge) => {
			union(edge[0], edge[1]);
		});
		const comboMapping = {};
		Object.keys(parentArr).forEach((key) => {
			parentArr[key] = find(key);
		});

		Object.keys(parentArr).forEach((key) => {
			const parent = parentArr[key];
			if (parent != key) {
				if (!comboMapping[parent]) {
					comboMapping[parent] = [parent];
				}
				comboMapping[parent].push(key);
			}
		});
		return Object.values(comboMapping);
	}

	addComboListener(fn: (combo: string[][]) => void) {
		this.comboListener.push(fn);
	}
}
