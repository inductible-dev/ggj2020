namespace Project {

    export class ShopActivityScene extends Phaser.Scene {

        static gameOverAfterExpiredPatrons:number = 1;

        container:Phaser.GameObjects.Container;

        sceneChangeButton:Phaser.GameObjects.Sprite;

        patronManager:PatronManager;

        patronsExpired = 0;
        patronsSatisfied = 0;

        constructor ()
        {
            super({ key: 'ShopActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            this.container.add(new Phaser.GameObjects.Sprite(this,+this.game.config.width/2,+this.game.config.height/2,'shop_bg'));

            // scene change button
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0 ,0, 'ui', 'scene_down');
            this.sceneChangeButton.setPosition( +this.game.config.width*0.5, (+this.game.config.height-this.sceneChangeButton.height*0.5)+30 ) ;
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup',this.changeActivity,this);
            this.sceneChangeButton.on('pointerover',()=>{ this.sceneChangeButton.setScale(1.1); },this);
            this.sceneChangeButton.on('pointerout',()=>{ this.sceneChangeButton.setScale(1); },this);
            this.container.add(this.sceneChangeButton);

            // patron manager
            this.patronManager = new PatronManager( this, (+this.game.config.width/2), (+this.game.config.height/2)-160 );
            this.patronManager.on(PATRON_MANAGER_EVENTS.PATRON_EXPIRED,this.onPatronExpired,this);
            this.container.add(this.patronManager);
            this.patronManager.start();
            this.patronManager.addPatron();

            this.cardCollection.enableDragDrop();
            
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT,this.onTransitionOut,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE,this.onTransitionComplete,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START,this.onTransitionStart,this);

        }        

        update(timestamp,elapsed)
        {
            this.patronManager.update(timestamp,elapsed);
        }

        checkEndGame()
        {
            if( this.patronsExpired >= ShopActivityScene.gameOverAfterExpiredPatrons ) this.gameOver();
        }

        gameOver()
        {
            this.patronManager.stop();
            alert('GAME OVER!');
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
                duration: 200,
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
            this.game.sound.play('transition');
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

        onPatronExpired()
        {
            this.patronsExpired++;

            console.log('patron expired!',this.patronsExpired);

            this.checkEndGame();
        }
        onPatronSatisfied()
        {
            this.patronsSatisfied++;

            console.log('patron satisfied!',this.patronsSatisfied);
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y - (<number>this.game.config.height);
        }

    }

}
