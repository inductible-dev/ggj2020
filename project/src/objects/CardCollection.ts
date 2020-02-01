namespace Project {

    export class CardCollection extends Phaser.GameObjects.Container
    {
        stacksByType = {};
        nStacks:number = 0;

        tempMatrix = new Phaser.GameObjects.Components.TransformMatrix();
        tempParentMatrix = new Phaser.GameObjects.Components.TransformMatrix();
        delta = new Phaser.Geom.Point();

        dragDropEnabled:boolean = false;

        constructor(scene: Phaser.Scene)
        {
            super(scene,0,0);
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

                    stack.x = (+this.scene.game.config.width/2) - (nWidth*0.5*(this.nStacks-1)) + (nWidth*i);
                    stack.y = (+this.scene.game.config.height) - 30;

                    i++ ;
                }
            }
        }

        collectCard(type:CARD_TYPES)
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
        removeCard(card:DragCard)
        {
            card.destroy();

            // curate the dictionary so that empty stacks are deleted
            for( var key in this.stacksByType ) 
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack = this.stacksByType[key];
                    if( !stack || stack.list.length == 0 ) 
                    {
                        this.stacksByType[key].destroy();
                        delete this.stacksByType[key];
                        this.nStacks--;
                    }
                }
            }

            this.updateLayout();
        }

        disableDragDrop()
        {
            if( !this.dragDropEnabled ) return ;
            for( var key in this.stacksByType )
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack = this.stacksByType[key];
                    if( ! stack ) continue;
                    stack.iterate((dragCard:DragCard)=>{
                        dragCard.disable();
                        this.scene.input.setDraggable(dragCard,false);
                    });
                }
            }
            this.scene.input.off('dragstart', this.onDragStart, this);
            this.scene.input.off('drag', this.onDrag, this);
            this.scene.input.off('dragend', this.onDragEnd, this);
            this.dragDropEnabled = false;
        }
        enableDragDrop()
        {
            if( this.dragDropEnabled ) return ;
            for( var key in this.stacksByType )
            {
                if( this.stacksByType.hasOwnProperty(key) )
                {
                    var stack = this.stacksByType[key];
                    if( stack.list.length == 0 ) continue;
                    var topCard:DragCard = stack.getAt(stack.list.length-1);
                    topCard.enable();
                    this.scene.input.setDraggable(topCard,true);
                }
            }
            this.scene.input.on('dragstart', this.onDragStart, this);
            this.scene.input.on('drag', this.onDrag, this);
            this.scene.input.on('dragend', this.onDragEnd, this);
            this.dragDropEnabled = true;
        }

        checkDrop(card:DragCard,wx:number,wy:number):boolean
        {
            var shopScene:ShopActivityScene = <ShopActivityScene>this.scene.scene.get('ShopActivityScene');
            
            var patronManager:PatronManager = shopScene.patronManager; 
            for( var i=0; i<patronManager.patrons.length; i++ )
            {
                var patron:Patron = patronManager.patrons[i];
                
                patron.getWorldTransformMatrix( this.tempMatrix, this.tempParentMatrix );
                var d:any = this.tempMatrix.decomposeMatrix();

                this.delta.setTo(d.translateX-wx,d.translateY-wy);
                var len = Phaser.Geom.Point.GetMagnitude(this.delta);
                
                if( len<=Patron.dropZoneRadius )
                {
                    console.log('---');
                    console.log('dropping card',card.type,'patron needs card?',patron.needsCardOfType(card.type));
                    console.log('patronWorldPos',d.translateX,d.translateY);
                    console.log('cardWorldPos',wx,wy);
                    console.log('len',len);
                    if( patron.needsCardOfType(card.type) ) 
                    {
                        patron.deliverCard(card.type);
                        this.removeCard(card);
                        return true;
                    }
                }
            }

            card.reset();

            return false;
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
        onDragEnd(pointer:Phaser.Input.Pointer, card:DragCard, dropped:boolean )
        {
            this.checkDrop(card,pointer.worldX,pointer.worldY);
        }
    }

}