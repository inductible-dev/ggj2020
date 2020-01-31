namespace Project {

	export class Application extends Phaser.Game
	{
		constructor()
		{
			super({
				type: Phaser.AUTO,
				scale: {
					parent: 'game-container',
					mode: Phaser.Scale.FIT,
					autoCenter: Phaser.Scale.CENTER_BOTH,
					width: 800,
					height: 600
				},
				backgroundColor: '#222222',
				scene: [ ShopActivityScene, PairsActivityScene ]
			});

			this.scene.start('ShopActivityScene');
		}
	}

}