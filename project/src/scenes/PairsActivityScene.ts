namespace Project {

    export class PairsActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;
        sceneChangeButton:Phaser.GameObjects.Sprite;

        cards:FlipCard[];

        comparatorA:FlipCard = null;
        comparatorB:FlipCard = null;

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

            // transition events
            this.events.on(Phaser.Scenes.Events.TRANSITION_OUT,this.onTransitionOut,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_START,this.onTransitionStart,this);
            this.events.on(Phaser.Scenes.Events.TRANSITION_COMPLETE,this.onTransitionComplete,this);
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
            var types:CARD_TYPES[] = [ 
                CARD_TYPES.CIRCLE, 
                CARD_TYPES.COG, 
                CARD_TYPES.DROP, 
                CARD_TYPES.SEGMENT, 
                CARD_TYPES.SQSTAR, 
                CARD_TYPES.SQUARE, 
                CARD_TYPES.TRAPEZOID, 
                CARD_TYPES.TRIANGLE 
            ];
            this.cards = [];
            for( var i=0; i<tPairs; i++)
            {
                var type = types[i%types.length];
                for( var p=0; p<2; p++) // make a pair
                {
                    var card = new FlipCard( this, 0, 0, type );
                    card.setScale(cScale);
                    this.cards.push(card);
                    this.container.add(card);
                    card.enable();
                    card.on(FLIP_CARD_EVENTS.DID_PRESS_BACK,this.onCardSelected,this);
                    card.on(FLIP_CARD_EVENTS.DESTROYED,this.onCardDestroy,this);
                    card.on(FLIP_CARD_EVENTS.HOVER_OVER,this.onCardHoverOver,this);
                    card.on(FLIP_CARD_EVENTS.HOVER_OUT,this.onCardHoverOut,this);
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

        get cardCollection():CardCollection
        {
            var ccScene:CardCollectionScene = <CardCollectionScene>this.scene.get('CardCollectionScene');
            return ccScene.cardCollection;
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
            if( this.comparatorA.type == this.comparatorB.type )
            {
                this.collectCardOfType(this.comparatorA.type);
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

        collectCardOfType(type:CARD_TYPES)
        {
            this.cardCollection.collect(type);
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
            console.log('pairs onTransitionOut');

            this.sceneChangeButton.visible = false;
        }
        onTransitionStart()
        {
            console.log('pairs onTransitionStart');

            this.sceneChangeButton.visible = false;
        }
        onTransitionComplete()
        {
            console.log('pairs onTransitionComplete');

            this.sceneChangeButton.visible = true;
        }

        public updateNeighbourPosition(y:number)
        {
            this.container.y = y + (<number>this.game.config.height);
        }

    }

}
