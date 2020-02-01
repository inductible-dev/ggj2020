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

                    var cWidth = (<Card>stack.getAt(0)).width;
                    var cHeight = (<Card>stack.getAt(0)).height * 0.2;
                    Phaser.Actions.GridAlign( stack.list, {
                        width: 1,
                        height: stack.list.length,
                        cellWidth: cWidth,
                        cellHeight: cHeight
                    });

                    stack.iterate( (child)=>{
                        child.angle = Phaser.Math.Between(-10,10);
                    });

                    stack.x = (nWidth*i); //- (this.nStacks*nWidth*0.5);
                    stack.y = 0;

                    i++ ;
                }
            }

            this.x = (+this.scene.game.config.width/2) - (nWidth*0.5*(this.nStacks-1));
            this.y = (+this.scene.game.config.height) - 100;
        }

        collect(card:Card)
        {
            var stack = this.stacksByType[card.frame.name];
            if( !stack ) 
            {
                this.stacksByType[card.frame.name] = stack = new Phaser.GameObjects.Container( this.scene );
                this.add(stack);
                this.nStacks++;
            }

            stack.add(card);

            this.updateLayout();
        }
    }

}