namespace Project {

    export class ShopActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;

        constructor ()
        {
            super({ key: 'ShopActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            var x = 100;
            var y = 100;

            for (var i = 0; i < 6; i++)
            {
                var image = new Phaser.GameObjects.Sprite(this, x, y, 'cards', 'back')
                this.container.add(image);

                image.setInteractive();

                this.input.setDraggable(image);

                x += 4;
                y += 4;
            }


            

            this.input.on('pointerdown', function () {
    
                this.input.stopPropagation();
               
                this.scene.transition({
                    target: 'PairsActivityScene',
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
            var sceneB:PairsActivityScene = <PairsActivityScene>this.scene.get('PairsActivityScene');
            this.container.y = (-600 * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y - (+this.game.config.height);
        }

    }

}
