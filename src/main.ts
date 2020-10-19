import Phaser from 'phaser'
import RatioScene from './scenes/ratioScene'
import MainScene from './scenes/MainScene'
import HomeScene from './scenes/homeScene'
import PhysicsScene from './scenes/physics'
import ThreePhysicsScene from './scenes/threePhysicsScene'
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	transparent: false, // 背景透明
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			// gravity: { y: 200 }
		}
	},
	scene: [ThreePhysicsScene]
}

export var game: Phaser.Game;

game = new Phaser.Game(config)

