namespace Project {

    export class CardCollectionScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;

        cardCollection:CardCollection;

        constructor ()
        {
            super({ key: 'CardCollectionScene', active: true });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);
            
            // collection view
            this.cardCollection = new CardCollection( this );
            this.container.add(this.cardCollection);
        }

        
    }

}
