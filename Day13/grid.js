class Grid{
    constructor( content ) {
        this.rows = [];
        this.width = 0;
        this.height = 0;
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;

        const parts = content.replace( /\r/g, "" ).split( "\n" ).filter( p => !!p );
        this.rows = parts.map( part => {
            const row = part.split("").map( ch => ch === "#" ? true : false );
            this.width = Math.max( this.width, row.length );
            return row;
        } );
        this.height = this.rows.length;
    }

    get( x, y ) {
        const row = this.rows[y];
        if ( !row ) return false;
        return row[x] || false;
    }

    set( x, y, val ) {
        let row = this.rows[y];
        if ( !row ) {
            this.rows[y] = row = [];
        }
        row[x] = val;

        if ( x < this.minX ) {
            this.minX = x;
        } else if ( x > this.maxX ) {
            this.maxX = x;
        }
        if ( y < this.minY ) {
            this.minX = y;
        } else if ( y > this.maxY ) {
            this.maxY = y;
        }
    }

    print() {
        const tilemap = [" ", "#", "¤", "=", "o"];
        for ( let y = this.minY; y <= this.maxY; ++y ) {
            let result = "";
            for ( let x = this.minX; x <= this.maxX; ++x ) {
                result += tilemap[this.get( x, y ) || 0];
            }
            console.log( result );
        }
    }

    forEach( cb ) {
        for ( let y = this.minY; y <= this.maxY; ++y ) {
            for ( let x = this.minX; x <= this.maxX; ++x ) {
                cb( this.get( x, y ) || 0, x, y );
            }
        }
    }
}

module.exports = Grid;