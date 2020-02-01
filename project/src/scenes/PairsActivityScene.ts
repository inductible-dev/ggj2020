namespace Project {

    export class PairsActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;
        sceneChangeButton:Phaser.GameObjects.Sprite;

        cards:Card[];

        comparatorA:Card = null;
        comparatorB:Card = null;

        cardCollection:CardCollection ;

        constructor ()
        {
            super({ key: 'PairsActivityScene', active: false });
        }
    
        create ()
        {
            this.container = this.add.container(0,0);

            // scene change button
            this.sceneChangeButton = new Phaser.GameObjects.Sprite(this, 0, 0, 'ui', 'scene_up');
            this.sceneChangeButton.setPosition( <number>this.game.config.width*0.5, this.sceneChangeButton.height*0.5 ) ;
            this.sceneChangeButton.setInteractive();
            this.sceneChangeButton.on('pointerup',this.changeActivity,this);
            this.container.add(this.sceneChangeButton);

            // pairs grid
            this.resetActivity();

            // collection view
            this.cardCollection = new CardCollection( this );
            this.container.add(this.cardCollection);

            // transition events
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT,this.onTransitionOut,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START,this.onTransitionStart,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE,this.onTransitionComplete,this);
        }

        preload ()
        {
            this.load.atlas( 'cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json' );
            this.load.atlas( 'ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json' );
        }

        resetActivity()
        {
            var nCardsW = 10;
            var nCardsH = 4;
            var groupOffsetX = 0;
            var groupOffsetY = -40;
            var tCards = nCardsW*nCardsH;
            var tPairs = tCards/2;
            var cScale = 0.5;
            var frames = [ 'triangle', 'circle', 'cog', 'drop', 'trapezoid', 'segment', 'sqstar', 'square' ];
            this.cards = [];
            for( var i=0; i<tPairs; i++)
            {
                var pairFrame = frames[i%frames.length];
                for( var p=0; p<2; p++) // make a pair
                {
                    var card = new Card( this, 0, 0, pairFrame );
                    card.setScale(cScale);
                    this.cards.push(card);
                    this.container.add(card);
                    card.enable();
                    card.on(CARD_EVENTS.DID_PRESS_BACK,this.onCardSelected,this);
                    card.on(CARD_EVENTS.DESTROYED,this.onCardDestroy,this);
                    card.on(CARD_EVENTS.HOVER_OVER,this.onCardHoverOver,this);
                    card.on(CARD_EVENTS.HOVER_OUT,this.onCardHoverOut,this);
                    card.setFaceDown();
                }
            }
            var paddingX = 10;
            var paddingY = 10;
            var nWidth = this.cards[0].width;
            var nHeight = this.cards[0].height;
            var cWidth = nWidth * cScale + paddingX;
            var cHeight = nHeight * cScale + paddingY;
            Phaser.Utils.Array.Shuffle(this.cards); // shuffle the pack
            Phaser.Actions.GridAlign(this.cards, { // lay out in a center-aligned grid
                width: nCardsW,
                height: nCardsH,
                cellWidth: cWidth,
                cellHeight: cHeight,
                x: (+this.game.config.width/2)-((cWidth*nCardsW)/2) + groupOffsetX,
                y: (+this.game.config.height/2)-((cHeight*nCardsH)/2) + groupOffsetY
            });
            for( i=0; i<this.cards.length; i++) this.cards[i].updateAnchor(); // allow the card to 'pin' to it's grid location
        }

        updateTransitionOut(progress)
        {
            var sceneB:ShopActivityScene = <ShopActivityScene>this.scene.get('ShopActivityScene');
            this.container.y = ((<number>this.game.config.height) * progress);
            sceneB.updateNeighbourPosition(this.container.y);
        }

        changeActivity()
        {
            this.scene.transition({
                target: 'ShopActivityScene',
                duration: 250,
                onUpdate: this.updateTransitionOut,
                sleep: true
            });
        }

        isComparatorReady()
        {
            return( this.comparatorA != null && this.comparatorB != null );
        }

        runComparator()
        {
            if( this.comparatorA.frame.name == this.comparatorB.frame.name )
            {
                this.collectCardOfType(this.comparatorA.frame.name);
                this.comparatorA.destroy();
                this.comparatorB.destroy();
            }
            else
            {
                this.comparatorA.reset();
                this.comparatorB.reset();
            }
            this.comparatorA = this.comparatorB = null;
        }

        collectCardOfType(type:string)
        {
            var c = new Card( this, 0, 0, type );
            this.cardCollection.collect(c);
        }

        onCardSelected(card)
        {
            if( this.isComparatorReady() ) return ; // awaiting comparator

            card.flip(true);
            if( this.comparatorA === null ) this.comparatorA = card;
            else if( this.comparatorB === null ) this.comparatorB = card;

            if( this.isComparatorReady() ) this.time.delayedCall( 1000, this.runComparator, null, this);
        }

        onCardHoverOver(card)
        {
            if( this.isComparatorReady() ) return ; // awaiting comparator

            this.container.bringToTop(card);
            card.raise();
        }
        onCardHoverOut(card)
        {
            if( this.isComparatorReady() ) return ; // awaiting comparator

            card.lower();
        }

        onCardDestroy(card)
        {
            var idx = this.cards.indexOf(card);
            if( idx > -1 ) this.cards.splice( idx, 1 );

            if( this.cards.length == 0 ) this.resetActivity();
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
            this.container.y = y + (<number>this.game.config.height);
        }

    }

}
