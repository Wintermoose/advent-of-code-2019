class Grid{

    constructor( content, defaultValue ) {
        this.rows = [];
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.defaultValue = defaultValue === undefined ? 0 : defaultValue;

        const parts = content.replace( /\r/g, "" ).split( "\n" ).filter( p => !!p );
        this.rows = parts.map( part => {
            const row = part.split("");
            this.maxX = Math.max( this.maxX, row.length-1 );
            return row;
        } );
        this.maxY = this.rows.length - 1;
    }

    get( x, y ) {
        const row = this.rows[y];
        if ( !row ) return this.defaultValue;
        if ( row[x] === undefined ) return this.defaultValue;
        return row[x];
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
            this.minY = y;
        } else if ( y > this.maxY ) {
            this.maxY = y;
        }
    }

    print( tilemap ) {
        let mapper = tilemap || (v => v);
        if ( typeof ( tilemap ) === "string" ) {
            mapper = v => tilemap[v];
        }

        for ( let y = this.minY; y <= this.maxY; ++y ) {
            let result = "";
            for ( let x = this.minX; x <= this.maxX; ++x ) {
                result += mapper(this.get( x, y ));
            }
            console.log( result );
        }
    }

    dump() {
        for ( let y = this.minY; y <= this.maxY; ++y ) {
            let result = "";
            for ( let x = this.minX; x <= this.maxX; ++x ) {
                result += String(this.get( x, y )).padStart(4) + " ";
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