import Phaser from 'phaser';
import { Board } from '~/core/Board';

export class Game extends Phaser.Scene {
	public board!: Board;
	constructor() {
		super('game');
	}

	create() {
		this.board = new Board(this);
		this.board.addComboListener((combo) => {
			// TODO: calculate damage
			console.log(combo);
		});
	}
}
