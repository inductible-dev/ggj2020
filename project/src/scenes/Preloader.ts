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
        }

        create()
        {
            this.scene.start('ShopActivityScene');
        }
    }
}