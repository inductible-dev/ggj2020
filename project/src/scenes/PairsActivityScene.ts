namespace Project {

    export class PairsActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;

        constructor ()
        {
            super({ key: 'PairsActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            var x = 100;
            var y = 100;

            for (var i = 0; i < 6; i++)
            {
                var image = new Phaser.GameObjects.Sprite(this, x, y, 'cards', 'triangle')
                this.container.add(image);

                image.setInteractive();

                this.input.setDraggable(image);

                x += 4;
                y += 4;
            }


            this.input.on('pointerdown', function () {
    
                this.input.stopPropagation();
                
                this.scene.transition({
                    target: 'ShopActivityScene',
                    duration: 750,
                    onUpdate: this.transitionOut
                });
            
            }, this);

        }

        preload ()
        {
            this.load.atlas( 'cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json' );
        }

        transitionOut(progress)
        {
            var sceneB:ShopActivityScene = <ShopActivityScene>this.scene.get('ShopActivityScene');
            this.container.y = (600 * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y + (+this.game.config.height);
        }

    }

}
