namespace Project {

    export enum PATRON_MANAGER_EVENTS {
        PATRON_EXPIRED = 'PATRON_EXPIRED',
        PATRON_SATISFIED = 'PATRON_SATISFIED'
    }

    export class PatronManager extends Phaser.GameObjects.Container {
        
        static minPatronSpawnTime = 6000;
        static maxPatronSpawnTime = 10000;
        static maxPatrons = 3;

        patrons:Patron[] = [];

        nextPatronCountdown:Phaser.Time.TimerEvent;

        constructor(scene: Phaser.Scene, x?: number, y?: number)
        {
            super(scene,x,y);
        }

        updateLayout()
        {
            var cellW = +this.scene.game.config.width/this.list.length; 
            Phaser.Actions.GridAlign( this.list, {
                width: this.list.length,
                height: 1,
                cellWidth: cellW,
                cellHeight: 0,
                x: cellW - (cellW*this.list.length*0.5)
            });
        }

        update()
        {
            for( var i=this.patrons.length-1; i>=0; i-- ) this.patrons[i].update();
        }

        addPatron()
        {
            var patron = new Patron( this.scene, 0, 0 );

            patron.once(PATRON_EVENTS.COUNTDOWN_EXPIRED,this.onPatronCountdownExpired,this);
            patron.once(PATRON_EVENTS.SATISFIED,this.onPatronSatisfied,this);

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

        start()
        {
            this.resetClock();
        }
        stop()
        {
            while(this.patrons.length) this.removePatron(this.patrons.pop());

            this.nextPatronCountdown.remove();
            this.nextPatronCountdown = null;
        }

        resetClock()
        {
            var nextPatronTime = Phaser.Math.Between(PatronManager.minPatronSpawnTime,PatronManager.maxPatronSpawnTime);
            console.log('nextPatronTime',nextPatronTime);
            this.nextPatronCountdown = this.scene.time.delayedCall( nextPatronTime, this.spawnPatron, null, this);
        }

        spawnPatron()
        {
            this.resetClock();

            if( this.patrons.length < PatronManager.maxPatrons ) this.addPatron();           
        }

        onPatronCountdownExpired(patron)
        {
            this.emit(PATRON_MANAGER_EVENTS.PATRON_EXPIRED,this,[patron]);
            this.removePatron(patron);
        }
        onPatronSatisfied(patron)
        {
            this.emit(PATRON_MANAGER_EVENTS.PATRON_SATISFIED,this,[patron]);
            this.removePatron(patron);
        }
    }

}