import 'babel-polyfill';

import { Game } from '~/scenes/Game';
import { Healthbar } from './Healthbar';

export class Enemy {
	private static readonly MAX_HEALTH: number = 100;

	private game: Game;

	public readonly maxHealth: number = Enemy.MAX_HEALTH;
	public health: number = this.maxHealth;
	public healthBar!: Healthbar;
	private attackListener: Array<(damage: number) => void> = [];
	private turnEndListener: Array<() => void> = [];

	constructor(game: Game) {
		this.game = game;
		this.setupHealthbar();

		// TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
		const enemySprite = this.game.add
			.sprite(465, 100, 'green-dragon-debug')
			.setScale(2.1);
	}

	setupHealthbar() {
		this.healthBar = new Healthbar(
			this.game,
			{
				// TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
				position: {
					x: 75,
					y: 50,
				},
				length: 200,
				width: 15,
			},
			this
		);
	}

	damage(amount: number): void {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
		}
		this.healthBar.draw();
	}

	async takeTurn(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 1000)); // emulating attack animation
		this.attackListener.forEach((fn) => fn(10)); // deal 10 damage
		this.turnEndListener.forEach((fn) => fn());
	}

	addAttackListener(listener: (damage: number) => void) {
		this.attackListener.push(listener);
	}

	addTurnEndListener(listener: () => void) {
		this.turnEndListener.push(listener);
	}
}
