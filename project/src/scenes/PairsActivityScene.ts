namespace Project {

    export class PairsActivityScene extends Phaser.Scene {

        container:Phaser.GameObjects.Container;
        sceneChangeButton:Phaser.GameObjects.Sprite;

        cards:Phaser.GameObjects.Sprite[];

        comparatorA:Card = null;
        comparatorB:Card = null;

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
            this.initPairsGrid();

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

        initPairsGrid()
        {
            var nCardsW = 10;
            var nCardsH = 4;
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
                    card.on('clicked',this.onCardSelected,this);
                    card.on('destroyed',this.onCardDestroy,this);
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
                x: (+this.game.config.width/2)-((cWidth*nCardsW)/2),
                y: (+this.game.config.height/2)-((cHeight*nCardsH)/2)
            });
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

        runComparator()
        {
            if( this.comparatorA.frame.name == this.comparatorB.frame.name )
            {
                this.comparatorA.destroy();
                this.comparatorB.destroy();
            }
            else
            {
                this.comparatorA.setFaceDown();
                this.comparatorB.setFaceDown();
            }
            this.comparatorA = this.comparatorB = null;
        }

        onCardSelected(card)
        {
            card.flip(true);
            if( this.comparatorA === null ) this.comparatorA = card;
            else if( this.comparatorB === null ) 
            {
                this.comparatorB = card;
                this.runComparator();
            }
        }

        onCardDestroy(card)
        {
            var idx = this.cards.indexOf(card);
            if( idx > -1 ) this.cards.splice( idx, 1 );
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
