namespace Project {

    export class ShopActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;
        sceneChangeButton:Phaser.GameObjects.Sprite;

        constructor ()
        {
            super({ key: 'ShopActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            // scene change button
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0 ,0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition( <number>this.game.config.width*0.5, <number>this.game.config.height - this.sceneChangeButton.height*0.5 ) ;
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup',this.changeActivity,this);
            this.container.add(this.sceneChangeButton);


            var x = 100;
            var y = 100;
            for (var i = 0; i < 6; i++)
            {
                var image = new Phaser.GameObjects.Sprite(this, x, y, 'cards', 'back');
                this.container.add(image);

                image.setInteractive();

                this.input.setDraggable(image);

                x += 4;
                y += 4;
            }


            var portrait = new Phaser.GameObjects.Sprite(this, +this.game.config.width/2, +this.game.config.height/2, 'portraits', 5 );
            this.container.add(portrait);


            this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

                gameObject.x = dragX;
                gameObject.y = dragY;
        
            });

            
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT,this.onTransitionOut,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE,this.onTransitionComplete,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START,this.onTransitionStart,this);

        }

        preload ()
        {
            this.load.atlas( 'cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json' );
            this.load.atlas( 'ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json' );
            this.load.spritesheet( 'portraits', 'assets/portraits.jpg', { frameWidth: 160, frameHeight: 120 } );
        }
        

        updateTransitionOut(progress)
        {
            var sceneB:PairsActivityScene = <PairsActivityScene>this.scene.get('PairsActivityScene');
            this.container.y = (-(<number>this.game.config.height) * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        }

        changeActivity()
        {
            this.scene.transition({
                target: 'PairsActivityScene',
                duration: 250,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        }

        onTransitionOut()
        {
            this.sceneChangeButton.visible = false;
        }
        onTransitionStart()
        {
            this.sceneChangeButton.visible = false;
        }
        onTransitionComplete()
        {
            this.sceneChangeButton.visible = true;
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y - (<number>this.game.config.height);
        }

    }

}
