import Phaser from 'phaser'
import RatioScene from './scenes/ratioScene'
import MainScene from './scenes/MainScene'
import HomeScene from './scenes/homeScene'
const config = {
	type: Phaser.AUTO,
	width: 500,
	height: 500,
	physics: {
		default: 'arcade'
	},
	scene: [RatioScene]
}

export var game: Phaser.Game;

game = new Phaser.Game(config)

