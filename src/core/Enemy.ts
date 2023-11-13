import 'babel-polyfill';

import { Game } from '~/scenes/Game';
import { Healthbar } from './Healthbar';
import { Constants } from '~/utils/Constants';

export class Enemy {
	private static readonly MAX_HEALTH: number = 100;
	private static readonly POSITION: { x: number; y: number } = {
		x: 465,
		y: 125,
	};

	public readonly maxHealth: number = Enemy.MAX_HEALTH;
	public health: number = this.maxHealth;
	public healthBar!: Healthbar;

	private game: Game;
	private turnsUntilAttack: number = 1;
	private nextMoveText: Phaser.GameObjects.Text;
	private attackListener: Array<(damage: number) => void> = [];
	private turnEndListener: Array<() => void> = [];

	constructor(game: Game) {
		this.game = game;
		this.setupHealthbar();

		// TODO: set positions relative to WINDOW_WIDTH, WINDOW_HEIGHT
		const enemySprite = this.game.add
			.sprite(Enemy.POSITION.x, Enemy.POSITION.y, 'green-dragon-debug')
			.setScale(2.1);

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
		}
		this.healthBar.draw();
	}

	async takeTurn(): Promise<void> {
		this.turnsUntilAttack--;
		this.nextMoveText.text = `Attacks in ${this.turnsUntilAttack} turns`;
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
}
