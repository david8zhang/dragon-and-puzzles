import { Game } from '~/scenes/Game';
import { Constants } from '~/utils/Constants';

export interface HealthbarConfig {
	position: {
		x: number;
		y: number;
	};
	length: number;
	width: number;
}
export class Healthbar {
	private scene: Game;

	private bar: Phaser.GameObjects.Graphics;
	private entity: { health: number; maxHealth: number };
	private config: HealthbarConfig;

	constructor(
		scene: Game,
		config: HealthbarConfig,
		entity: { health: number; maxHealth: number }
	) {
		this.scene = scene;
		this.entity = entity;
		this.config = config;

		// Draw bar
		this.bar = new Phaser.GameObjects.Graphics(this.scene);
		this.bar.setDepth(Constants.SORT_ORDER.ui);
		this.scene.add.existing(this.bar);
		this.draw();

		this.scene.add
			.image(this.config.position.x + 10, this.config.position.y + 8, 'heart')
			.setTintFill(0xff0000)
			.setScale(0.5)
			.setDepth(Constants.SORT_ORDER.ui);
	}

	draw(): void {
		this.bar.clear();
		const percentage = this.entity.health / this.entity.maxHealth;
		const length = Math.max(0, Math.floor(percentage * this.config.length));
		this.bar.fillStyle(0xffffff);

		// Draw a black rectangle for healthbar BG
		this.bar.fillRect(
			this.config.position.x + 30,
			this.config.position.y,
			this.config.length,
			this.config.width
		);

		if (percentage <= 0.33) {
			this.bar.fillStyle(0xff0000);
		} else if (percentage <= 0.67) {
			this.bar.fillStyle(0xf1c40f);
		} else {
			this.bar.fillStyle(0x2ecc71);
		}

		// Draw a colored rectangle to represent health
		this.bar.fillRect(
			this.config.position.x + 30,
			this.config.position.y,
			length,
			this.config.width
		);
	}
}
