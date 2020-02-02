namespace Project {

    export enum PATRON_EVENTS {
        COUNTDOWN_EXPIRED = 'COUNTDOWN_EXPIRED',
        SATISFIED = 'SATISFIED'
    }

    export class Patron extends Phaser.GameObjects.Container 
    {
        static nFrames = 107;
        static iconCellWidth = 50;
        static dropZoneRadius = 200;

        static countdownTime = 90000;
        static rewardProgress = 0.25;

        static GREEN = 0x00ff00;
        static RED = 0xff0000;
        static YELLOW = 0xffff00;

        portrait: Phaser.GameObjects.Sprite;

        request:CARD_TYPES[] = [];

        requestIcons: Phaser.GameObjects.Sprite[] = [];
        requestIconContainer: Phaser.GameObjects.Container;

        dropZone:Phaser.GameObjects.Zone;

        timeBar:Phaser.GameObjects.Graphics;

        endTime:number = 0;

        expired:boolean ;

        bg:Phaser.GameObjects.Graphics;

        constructor( scene: Phaser.Scene, x: number, y: number )
        {
            super( scene, x, y );

            this.portrait = new Phaser.GameObjects.Sprite( scene, 0, 0, 'portraits', 0 );
            this.portrait.setOrigin(0.5);
            
            this.portrait.setScale(1.5);
            this.add(this.portrait);

            this.requestIconContainer = new Phaser.GameObjects.Container( scene, 0, 0 );
            this.add(this.requestIconContainer);

            this.timeBar = new Phaser.GameObjects.Graphics( scene );
            this.add(this.timeBar);
            this.updateTimeBar(1);

            this.pickRandomFrame();
            this.generateRequest();

            this.bg = new Phaser.GameObjects.Graphics( this.scene );
            var pw = this.portrait.width*this.portrait.scale;
            var ph = 300;
            this.bg.fillStyle( 0xffffff, 1 );
            this.bg.fillRoundedRect( -pw*0.5, (-ph*0.5)+30, pw, ph, 10);
            this.addAt(this.bg,0);

            this.dropZone = new Phaser.GameObjects.Zone( this.scene, 0, 0 ).setRectangleDropZone( this.portrait.width, this.portrait.height );
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

            this.timeBar.x = this.portrait.x - ((this.portrait.width*this.portrait.scale)/2);
            this.timeBar.y = this.portrait.y + ((this.portrait.height*this.portrait.scale)/2);
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

        updateTimeBar(progress:number)
        {
            this.timeBar.clear();
            var col = Patron.GREEN;
            if( progress < 0.5 ) col = Patron.YELLOW;
            if( progress < 0.25 ) col = Patron.RED;
            this.timeBar.fillStyle(col, 1);
            this.timeBar.fillRect( 0, 0, this.portrait.width*this.portrait.scale*progress, 10 );
        }

        generateRequest()
        {
            this.expired = false;

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
                if( Math.random() > 0.8 || (this.request.length >= 3) ) escape = true;
            }

            this.updateRequestView();

            this.startCountDown();
        }

        getDropZone():Phaser.Geom.Rectangle
        {
            return this.dropZone.getBounds();
        }

        update(timestamp,elapsed)
        {
            if( this.expired ) this.countdownExpired();

            var clockTime = new Date().getTime();

            var deltaTime = this.endTime-clockTime;

            var p = deltaTime / Patron.countdownTime;
            this.updateTimeBar(p);

            if( p <= 0 ) 
            {
                this.expired = true;
                this.countdownExpired();
            }
        }

        startCountDown()
        {
            this.endTime = new Date().getTime() + Patron.countdownTime;
        }

        countdownExpired()
        {
            this.emit(PATRON_EVENTS.COUNTDOWN_EXPIRED,this,[this]);
        }

        needsCardOfType(type)
        {
            return (this.request.indexOf(type) > -1);
        }

        deliverCard(type)
        {
            var idx = this.request.indexOf(type);
            if( idx > -1 ) 
            {
                this.request.splice(idx,1);
                this.updateRequestView();
            }

            // award some time
            var clockTime = new Date().getTime();
            var deltaTime = this.endTime-clockTime;
            var p = deltaTime / Patron.countdownTime;

console.log('deliver card at p',p);

            p = p + Patron.rewardProgress;
            p = Math.min( 1, p );
            this.endTime = clockTime + Patron.countdownTime * p;
            console.log('reward',p);

            if( this.request.length == 0 ) this.patronSatisfied();
        }

        patronSatisfied()
        {
            this.emit(PATRON_EVENTS.SATISFIED,this,[this]);
        }
    }
}
