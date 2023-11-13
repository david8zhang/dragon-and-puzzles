export class Preload extends Phaser.Scene {
	constructor() {
		super('preload');
	}

	preload() {
		this.load.image('green-dragon-debug', 'flygon.png');
		this.load.image('fire-dragon-debug', 'charizard.png');
		this.load.image('water-dragon-debug', 'gyarados.png');
		this.load.image('gameover', 'gameover.png');
	}

	create() {
		this.scene.start('game');
	}
}
