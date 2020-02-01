namespace Project {

    export class CardCollection extends Phaser.GameObjects.Container
    {
        stacksByType = {};
        nStacks:number = 0;

        constructor(scene: Phaser.Scene, x?: number, y?: number)
        {
            super(scene,x,y);
        }

        updateLayout()
        {
            var i = 0 ;
            var nWidth = 110;
            
            for( var key in this.stacksByType )
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack:Phaser.GameObjects.Container = this.stacksByType[key];

                    stack.iterate( (child)=>{
                        child.angle = Phaser.Math.Between(-5,5);
                        child.updateAnchor();
                    });

                    stack.x = (nWidth*i);
                    stack.y = 0;

                    i++ ;
                }
            }

            this.x = (+this.scene.game.config.width/2) - (nWidth*0.5*(this.nStacks-1));
            this.y = (+this.scene.game.config.height) - 30;
        }

        collect(type:CARD_TYPES)
        {
            var card = new DragCard( this.scene, 0, 0, type );
            card.on(FLIP_CARD_EVENTS.HOVER_OVER,this.onCardHoverOver,this);
            card.on(FLIP_CARD_EVENTS.HOVER_OUT,this.onCardHoverOut,this);

            var stack = this.stacksByType[type];
            if( !stack ) 
            {
                this.stacksByType[type] = stack = new Phaser.GameObjects.Container( this.scene );
                this.add(stack);
                this.nStacks++;
            }

            stack.add(card);

            this.updateLayout();
        }

        disableDragDrop()
        {
            for( var key in this.stacksByType )
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack = this.stacksByType[key];
                    stack.iterate((dragCard:DragCard)=>{
                        dragCard.disable();
                        this.scene.input.setDraggable(dragCard,false);
                    });
                }
            }
            this.scene.input.off('dragstart', this.onDragStart, this);
            this.scene.input.off('drag', this.onDrag, this);
            this.scene.input.off('dragend', this.onDragEnd, this);
        }
        enableDragDrop()
        {
            for( var key in this.stacksByType )
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack = this.stacksByType[key];
                    var topCard:DragCard = stack.getAt(stack.list.length-1);
                    topCard.enable();
                    this.scene.input.setDraggable(topCard,true);
                }
            }
            this.scene.input.on('dragstart', this.onDragStart, this);
            this.scene.input.on('drag', this.onDrag, this);
            this.scene.input.on('dragend', this.onDragEnd, this);
        }

        checkDrop(card:DragCard)
        {
            var shopScene:ShopActivityScene = <ShopActivityScene>this.scene.scene.get('ShopActivityScene');
            
            var patronManager:PatronManager = shopScene.patronManager; 
            for( var i=0; i<patronManager.patrons.length; i++ )
            {
                var patron:Patron = patronManager.patrons[i];
                console.log('checkdrop',patron,card);
            }
            
        }

        onCardHoverOver(card:DragCard)
        {
            this.bringToTop(card);
            card.raise();
        }
        onCardHoverOut(card:DragCard)
        {
            card.lower();
        }

        onDragStart(pointer, card:DragCard)
        {
            card.parentContainer.bringToTop(card);
        }
        onDrag(pointer, card:DragCard, dragX:number, dragY:number )
        {
            card.x = dragX;
            card.y = dragY;
        }
        onDragEnd(pointer, card:DragCard, dropped:boolean )
        {
            this.checkDrop(card);
        }
    }

}