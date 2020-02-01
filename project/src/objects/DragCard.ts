namespace Project {

    export enum DRAG_CARD_EVENTS {
        DESTROYED = 'DESTROYED',
        HOVER_OVER = 'HOVER_OVER',
        HOVER_OUT = 'HOVER_OUT'
    }

    export class DragCard extends Phaser.GameObjects.Sprite 
    {
        static atlasName = 'cards';

        type:CARD_TYPES;

        anchorX:number = 0;
        anchorY:number = 0;
        anchorScale:number = 1;
        anchorRotation:number = 0;

        constructor( scene: Phaser.Scene, x: number, y: number, type: CARD_TYPES )
        {
            super( scene, x, y, FlipCard.atlasName, type );

            this.type = type;
            
            this.setOrigin(0.5);

            this.on('pointerover', (pointer) => {
                this.emit(DRAG_CARD_EVENTS.HOVER_OVER, this);
            }, this);
            this.on('pointerout', (pointer) => {
                this.emit(DRAG_CARD_EVENTS.HOVER_OUT, this);
            }, this);
        }

        destroy(fromScene?:boolean)
        {
            this.emit(DRAG_CARD_EVENTS.DESTROYED,this);
            super.destroy(fromScene);
        }

        raise()
        {
            this.rotation = this.anchorRotation + ((2*Math.PI)/360)*Phaser.Math.Between(-10,10); 
            this.setScale( this.anchorScale + 0.1 );
        }
        lower()
        {
            this.reset();
        }
        reset()
        {
            this.x = this.anchorX;
            this.y = this.anchorY;
            this.rotation = this.anchorRotation;
            this.setScale(this.anchorScale);
        }

        enable()
        {
            this.setInteractive();
        }
        disable()
        {
            this.disableInteractive();
        }

        updateAnchor()
        {
            this.anchorX = this.x;
            this.anchorY = this.y;
            this.anchorScale = this.scale;
            this.anchorRotation = this.rotation;

            this.reset();
        }

    }
}