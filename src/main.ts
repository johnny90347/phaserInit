import Phaser from 'phaser'
import MainScene from './scenes/MainScene'
import HomeScene from './scenes/homeScene'
const config = {
	type: Phaser.AUTO,
	width: 1024,
	height: 768,
	physics: {
		default: 'arcade'
	},
	scene: [HomeScene]
}

export var game: Phaser.Game;

game = new Phaser.Game(config)

