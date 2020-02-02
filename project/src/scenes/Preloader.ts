namespace Project {

    export class Preloader extends Phaser.Scene {
        constructor(){
            super({ key: 'Preloader', active: false });
        }

        preload()
        {
            this.load.atlas( 'cards', 'assets/atlas/cards.png', 'assets/atlas/cards.json' );
            this.load.atlas( 'ui', 'assets/atlas/ui.png', 'assets/atlas/ui.json' );
            this.load.spritesheet( 'portraits', 'assets/portraits.jpg', { frameWidth: 160, frameHeight: 120 } );
            this.load.image( 'shop_bg', 'assets/shop.png' );
            this.load.image( 'parts_bg', 'assets/parts.png' );

            this.load.audio( 'doorbell', 'assets/sfx/doorentry.mp3' );
            this.load.audio( 'music', 'assets/sfx/bensound-badass.mp3' );
            this.load.audio( 'yeah', 'assets/sfx/yeah.mp3' );
            this.load.audio( 'comparator', 'assets/sfx/comparator.mp3' );
            this.load.audio( 'transition', 'assets/sfx/transition.mp3' );
            this.load.audio( 'collect', 'assets/sfx/collect.mp3' );
            this.load.audio( 'incorrect', 'assets/sfx/incorrect.mp3' );
            this.load.audio( 'flip', 'assets/sfx/flip.mp3' );
        }

        create()
        {
            this.game.sound.add('music');
            this.game.sound.play('music',{volume:0.5});

            this.game.sound.add('doorbell');
            this.game.sound.add('comparator');
            this.game.sound.add('yeah');
            this.game.sound.add('collect');
            this.game.sound.add('transition');
            this.game.sound.add('incorrect');
            this.game.sound.add('flip');

            this.scene.start('TitleScene');
        }
    }
}