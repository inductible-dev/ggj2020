namespace Project {

    enum CardFace {
        FRONT = 'front',
        BACK = 'back'
    }

    export class Card extends Phaser.GameObjects.Sprite 
    {
        static atlasName = 'cards';
        static backFrame = 'back';

        frontFrame:string;
        backFrame:string;

        constructor( scene: Phaser.Scene, x: number, y: number, frontFrame?: string )
        {
            super( scene, x, y, Card.atlasName, frontFrame );

            this.frontFrame = frontFrame;
            this.backFrame = Card.backFrame;

            this.on('pointerup', (pointer) => {
                this.emit('clicked', this);
            }, this);
        }

        destroy(fromScene?:boolean)
        {
            this.emit('destroyed', this);
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
            if( <string>this.frame.name == this.frontFrame ) this.showFace(CardFace.BACK);
            else if( <string>this.frame.name == this.backFrame ) this.showFace(CardFace.FRONT);
        }
        showFace(face:string,animated:boolean=true)
        {
            switch(face)
            {
                case CardFace.FRONT:
                    this.setFrame(this.frontFrame);
                    break;
                case CardFace.BACK:
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

    }
}