namespace Project {

    export enum CardFace {
        FRONT = 'front',
        BACK = 'back'
    }

    export enum FLIP_CARD_EVENTS {
        DESTROYED = 'DESTROYED',
        DID_PRESS_FRONT = 'DID_PRESS_FRONT',
        DID_PRESS_BACK = 'DID_PRESS_BACK',
        WILL_SHOW_FRONT = 'WILL_SHOW_FRONT',
        WILL_SHOW_BACK = 'WILL_SHOW_BACK',
        HOVER_OVER = 'HOVER_OVER',
        HOVER_OUT = 'HOVER_OUT'
    }

    export class FlipCard extends Phaser.GameObjects.Sprite 
    {
        static atlasName = 'cards';
        static backFrame = 'back';

        type:CARD_TYPES;
        backFrame:string;

        raiseTween:Phaser.Tweens.Tween;
        lowerTween:Phaser.Tweens.Tween;

        anchorX:number = 0;
        anchorY:number = 0;
        anchorScale:number = 1;
        anchorRotation:number = 0;
        
        constructor( scene: Phaser.Scene, x: number, y: number, type: CARD_TYPES )
        {
            super( scene, x, y, FlipCard.atlasName, type );

            this.type = type;
            this.backFrame = FlipCard.backFrame;

            this.setOrigin(0.5);

            this.on('pointerup', (pointer) => {
                switch(this.frame.name)
                {
                    case this.backFrame:
                        this.emit(FLIP_CARD_EVENTS.DID_PRESS_BACK, this);
                        break;
                }
            }, this);

            this.on('pointerover', (pointer) => {
                switch(this.frame.name)
                {
                    case this.backFrame:
                        this.emit(FLIP_CARD_EVENTS.HOVER_OVER, this);
                        break;
                }
            }, this);
            this.on('pointerout', (pointer) => {
                switch(this.frame.name)
                {
                    case this.backFrame:
                        this.emit(FLIP_CARD_EVENTS.HOVER_OUT, this);
                        break;
                }
            }, this);
        }

        destroy(fromScene?:boolean)
        {
            this.emit(FLIP_CARD_EVENTS.DESTROYED,this);
            super.destroy(fromScene);
        }

        enable()
        {
            this.setInteractive();
        }
        disable()
        {
            this.disableInteractive();
        }

        flip(animated:boolean=true)
        {
            if( <string>this.frame.name == this.type ) this.showFace(CardFace.BACK);
            else if( <string>this.frame.name == this.backFrame ) this.showFace(CardFace.FRONT);
        }
        showFace(face:string,animated:boolean=true)
        {
            switch(face)
            {
                case CardFace.FRONT:
                    this.emit(FLIP_CARD_EVENTS.WILL_SHOW_FRONT, this);
                    this.setFrame(this.type);
                    break;
                case CardFace.BACK:
                    this.emit(FLIP_CARD_EVENTS.WILL_SHOW_BACK, this);
                    this.setFrame(this.backFrame);
                    break;
            }
        }
        setFaceUp()
        {
            this.showFace(CardFace.FRONT);
        }
        setFaceDown()
        {
            this.showFace(CardFace.BACK);
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
            this.setFaceDown();
            this.rotation = this.anchorRotation;
            this.setScale(this.anchorScale);
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