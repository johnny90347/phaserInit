import Phaser from 'phaser'
import MainScene from './scenes/MainScene'
const config = {
	type: Phaser.AUTO,
	width: 1024,
	height: 768,
	scene: [MainScene]
}

export var game:Phaser.Game;

game = new Phaser.Game(config)
