import Phaser from 'phaser'
import MainScene from './scenes/MainScene'
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: [MainScene]
}

export default new Phaser.Game(config)
