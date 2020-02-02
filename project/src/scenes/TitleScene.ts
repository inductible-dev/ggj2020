namespace Project {

    export class TitleScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;
        playButton:Phaser.GameObjects.Sprite;

       
        constructor ()
        {
            super({ key: 'TitleScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            this.container.add(new Phaser.GameObjects.Sprite(this,+this.game.config.width/2,+this.game.config.height/2,'title_bg'));

            // scene change button
            var playButton = new Phaser.GameObjects.Sprite(this, 0 ,0, 'ui', 'playbutt');
            playButton.setPosition( +this.game.config.width*0.5, (+this.game.config.height-playButton.height*0.5)+30 ) ;
            playButton.setInteractive();
            playButton.on('pointerup',this.changeActivity,this);
            playButton.on('pointerover',()=>{ playButton.setScale(1.1); },this);
            playButton.on('pointerout',()=>{ playButton.setScale(1); },this);
            this.container.add(playButton);
        }

        changeActivity()
        {
            this.scene.start('ShopActivityScene');
        }

    }

}
