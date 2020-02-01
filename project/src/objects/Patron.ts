namespace Project {

    export class Patron extends Phaser.GameObjects.Container 
    {
        static nFrames = 107;
        static iconCellWidth = 50;
        static dropZoneRadius = 128;

        portrait: Phaser.GameObjects.Sprite;

        request:CARD_TYPES[] = [];

        requestIcons: Phaser.GameObjects.Sprite[] = [];
        requestIconContainer: Phaser.GameObjects.Container;

        dropZone:Phaser.GameObjects.Zone;

        constructor( scene: Phaser.Scene, x: number, y: number )
        {
            super( scene, x, y );

            this.portrait = new Phaser.GameObjects.Sprite( scene, 0, 0, 'portraits', 0 );
            this.portrait.setScale(1.5);
            this.add(this.portrait);

            this.dropZone = new Phaser.GameObjects.Zone( this.scene, 0, 0 ).setCircleDropZone(128);
            var graphics = new Phaser.GameObjects.Graphics( this.scene );
            graphics.lineStyle(2, 0xffff00);
            graphics.strokeCircle( this.dropZone.x, this.dropZone.y, this.dropZone.input.hitArea.radius );
            this.add(this.dropZone);
            this.add(graphics);

            this.requestIconContainer = new Phaser.GameObjects.Container( scene, 0, 0 );
            this.add(this.requestIconContainer);
            
            this.pickRandomFrame();
            this.generateRequest();
        }

        pickRandomFrame()
        {
            this.portrait.setFrame(Phaser.Math.Between(0,Patron.nFrames));
            this.updateLayout();
        }

        updateLayout()
        {
            this.requestIconContainer.x = this.portrait.x - ((Patron.iconCellWidth*(this.requestIcons.length-1))/2);
            this.requestIconContainer.y = this.portrait.y + this.portrait.height;
        }

        updateRequestView()
        {
            while(this.requestIcons.length) this.requestIcons.pop().destroy();

            for( var i=0; i<this.request.length; i++ )
            {
                var rCode = this.request[i];
                var rIcon = new Phaser.GameObjects.Sprite( this.scene, 0, 0, 'ui', rCode );
                this.requestIcons.push(rIcon);
                this.requestIconContainer.add(rIcon);
            }

            Phaser.Actions.GridAlign( this.requestIcons, {
                width: this.requestIcons.length,
                height: 1,
                cellWidth: Patron.iconCellWidth,
                cellHeight: 0
            });

            this.updateLayout();
        }

        generateRequest()
        {
            this.request = [];

            var resourceTypes = [ 
                CARD_TYPES.CIRCLE, 
                CARD_TYPES.COG, 
                CARD_TYPES.DROP, 
                CARD_TYPES.SEGMENT, 
                CARD_TYPES.SQSTAR, 
                CARD_TYPES.SQUARE, 
                CARD_TYPES.TRAPEZOID, 
                CARD_TYPES.TRIANGLE 
            ];

            var escape = false;
            while( ! escape )
            {
                var idx = Math.floor(resourceTypes.length*Math.random());
                this.request.push(resourceTypes[idx]);
                if( Math.random() > 0.8 || (this.request.length >= 5) ) escape = true;
            }

            this.updateRequestView();
        }

        deliverCard(type)
        {
            var idx = this.request.indexOf(type);
            if( idx > -1 ) 
            {
                this.request.splice(idx,1);
                this.updateRequestView();
            }

            if( this.request.length == 0 ) this.patronSatisfied();
        }

        patronSatisfied()
        {
            alert('satisfied');
        }
    }
}
