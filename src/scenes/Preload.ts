export class Preload extends Phaser.Scene {
	constructor() {
		super('preload');
	}

	preload() {
		this.load.image('green-dragon-debug', 'flygon.png');
		this.load.image('fire-dragon-debug', 'charizard.png');
		this.load.image('water-dragon-debug', 'gyarados.png');
		this.load.image('gameover', 'gameover.png');

		this.load.image('orb', 'orb.png');
		this.load.image('orb-red', 'orb-red.png');
		this.load.image('orb-blue', 'orb-blue.png');
		this.load.image('orb-green', 'orb-green.png');
		this.load.image('orb-yellow', 'orb-yellow.png');
		this.load.image('orb-purple', 'orb-purple.png');
		this.load.image('orb-pink', 'orb-pink.png');
	}

	create() {
		this.scene.start('game');
	}
}
