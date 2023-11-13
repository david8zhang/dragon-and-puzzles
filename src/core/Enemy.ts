import 'babel-polyfill';

import { Game } from '~/scenes/Game';
import { Healthbar } from './Healthbar';

export interface EnemyConfig {
	maxHealth: number;
	spriteName: string;
}

export const ENEMIES: EnemyConfig[] = [
	{
		maxHealth: 10,
		spriteName: 'green-dragon-debug',
	},
	{
		maxHealth: 150,
		spriteName: 'water-dragon-debug',
	},
];

export class Enemy {
	private static readonly POSITION: { x: number; y: number } = {
		x: 465,
		y: 125,
	};

	public readonly maxHealth: number;
	public health: number;
	public healthBar!: Healthbar;

	private game: Game;
	private turnsUntilAttack: number = 1;
	private nextMoveText: Phaser.GameObjects.Text;
	private attackListener: Array<(damage: number) => void> = [];
	private turnEndListener: Array<() => void> = [];
	private onDiedListener: Array<() => void> = [];

	constructor(game: Game, config: EnemyConfig) {
		this.game = game;

		// Set up health
		this.maxHealth = config.maxHealth;
		this.health = this.maxHealth;
		this.setupHealthbar();

		// Set up sprite
		// TODO: add animations for enemy
		const enemySprite = this.game.add
			.sprite(Enemy.POSITION.x, Enemy.POSITION.y, config.spriteName)
			.setScale(2.1);

		// Set up next move text
		// TODO: Refactor this into its own fn?
		this.nextMoveText = this.game.add
			.text(
				Enemy.POSITION.x,
				Enemy.POSITION.y - 115,
				`Attacks in ${this.turnsUntilAttack} turns`
			)
			.setStyle({
				fontSize: '20px',
				fontFamily: 'VCR',
			})
			.setStroke('#000000', 10);
		// Center align text
		this.nextMoveText.setPosition(
			this.nextMoveText.x - this.nextMoveText.displayWidth / 2,
			this.nextMoveText.y
		);
		this.animateNextMoveText();
	}

	animateNextMoveText() {
		this.game.tweens.addCounter({
			from: 255,
			to: 0,
			duration: 1000,
			repeat: -1,
			yoyo: true,
			onUpdate: (tween) => {
				const color = Phaser.Display.Color.Interpolate.RGBWithRGB(
					// Tween from: #FF6464
					255,
					100,
					100,
					// Tween to: #FFFFFF
					255,
					255,
					255,
					// Tween params
					255, // length
					tween.getValue() // index
				);
				this.nextMoveText.setColor(
					Phaser.Display.Color.RGBToString(color.r, color.g, color.b, color.a)
				);
			},
		});
	}

	setupHealthbar() {
		this.healthBar = new Healthbar(
			this.game,
			{
				// TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
				position: {
					x: Enemy.POSITION.x - 390,
					y: Enemy.POSITION.y - 50,
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
			this.onDiedListener.forEach((fn) => fn());
		}
		this.healthBar.draw();
	}

	async takeTurn(): Promise<void> {
		// Enemy already dead, no need to take turn
		if (this.health <= 0) return;

		this.turnsUntilAttack--;
		this.nextMoveText.text = `Attacks in ${this.turnsUntilAttack} turns`;
		// TODO: add attack animations
		await new Promise((resolve) => setTimeout(resolve, 1000)); // emulating attack animation

		if (this.turnsUntilAttack === 0) {
			this.attackListener.forEach((fn) => fn(10)); // deal 10 damage
			this.turnsUntilAttack = Math.floor(Math.random() * 3 + 1);
		}

		this.nextMoveText.text = `Attacks in ${this.turnsUntilAttack} turns`;
		this.turnEndListener.forEach((fn) => fn());
	}

	addAttackListener(listener: (damage: number) => void) {
		this.attackListener.push(listener);
	}

	addTurnEndListener(listener: () => void) {
		this.turnEndListener.push(listener);
	}

	addOnDiedListener(listener: () => void) {
		this.onDiedListener.push(listener);
	}
}
