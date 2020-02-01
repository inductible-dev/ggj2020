namespace Project {

    export class PatronManager extends Phaser.GameObjects.Container {
        
        static patronCellWidth = 800/3;

        patrons:Patron[] = [];

        constructor(scene: Phaser.Scene, x?: number, y?: number)
        {
            super(scene,x,y);
        }

        updateLayout()
        {
            Phaser.Actions.GridAlign( this.list, {
                width: this.list.length,
                height: 1,
                cellWidth: PatronManager.patronCellWidth,
                cellHeight: 0,
                x: (+this.scene.game.config.width/2),
                y: (+this.scene.game.config.height/2)-150
            });
        }

        addPatron()
        {
            var patron = new Patron( this.scene, 0, 0 );
            this.patrons.push(patron);
            this.add(patron);

            this.updateLayout();
        }
        removePatron(patron:Patron)
        {
            var idx = this.patrons.indexOf(patron);
            if( idx > -1 ) this.patrons.splice(idx,1);

            patron.destroy();

            this.updateLayout();
        }
    }

}