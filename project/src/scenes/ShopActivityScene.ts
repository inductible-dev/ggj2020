namespace Project {

    export class ShopActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;

        sceneChangeButton:Phaser.GameObjects.Sprite;

        patronManager:PatronManager;

        constructor ()
        {
            super({ key: 'ShopActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            // scene change button
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0 ,0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition( <number>this.game.config.width*0.5, this.sceneChangeButton.height*0.5 ) ;
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup',this.changeActivity,this);
            this.container.add(this.sceneChangeButton);

            // patron manager
            this.patronManager = new PatronManager( this, 0, 0 );
            this.container.add(this.patronManager);

            this.patronManager.addPatron();
            this.patronManager.addPatron();
            this.patronManager.addPatron();
            
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT,this.onTransitionOut,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE,this.onTransitionComplete,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START,this.onTransitionStart,this);

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

        get cardCollection():CardCollection
        {
            var ccScene:CardCollectionScene = <CardCollectionScene>this.scene.get('CardCollectionScene');
            return ccScene.cardCollection;
        }

        onTransitionOut()
        {
            this.cardCollection.disableDragDrop();
            this.sceneChangeButton.visible = false;
        }
        onTransitionStart()
        {
            this.sceneChangeButton.visible = false;
        }
        onTransitionComplete()
        {
            this.cardCollection.enableDragDrop();
            this.sceneChangeButton.visible = true;
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y - (<number>this.game.config.height);
        }

    }

}
