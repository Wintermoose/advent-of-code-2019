const Grid = require( "./grid" );

class Terminal {
    constructor() {
        this.grid = new Grid( "", " " );
        this.x = 0;
        this.y = 0;        
    }

    store( val ) {
        val = Number(val);
        if ( val === 10 ) {
            if ( this.x === 0 ) {
                this.y = 0;
                this.grid.print();
                console.log( " " );
                this.grid = new Grid( "", " " );
            } else {
                this.x = 0;
                this.y += 1;
            }
        } else {
            this.grid.set( this.x, this.y, String.fromCharCode( val ) );
            this.x += 1;
        }
    }
}

module.exports = Terminal;