class Grid{
    constructor( content ) {
        this.rows = [];
        this.width = 0;
        this.height = 0;

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
}

module.exports = Grid;