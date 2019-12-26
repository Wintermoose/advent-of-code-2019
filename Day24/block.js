const Grid = require( "./grid" );

class Block {

    constructor( grids, defaultValue ) {
        this.defaultValue = defaultValue === undefined ? 0 : defaultValue;
        if ( !grids || grids.length === 0 ) grids = [new Grid( "", defaultValue )];
        this.grids = grids;
        this.minX = this.maxX = this.minY = this.maxY = 0;
        this.minZ = 0;
        this.maxZ = grids.length - 1;
        this.grids.forEach( g => {
            this._updateBounds( g );
        } );
    }

    get( x, y, z ) {
        const grid = this.grids[z];
        if ( !grid ) return this.defaultValue;
        return grid.get( x, y );
    }

    set( x, y, z, val ) {
        //if ( isNaN( z ) ) console.trace();
        let grid = this.grids[z];
        if ( !grid ) {
            grid = this.grids[z] = new Grid( "", this.defaultValue );
            if ( z < this.minZ ) {
                this.minZ = z;
            } else if ( z > this.maxZ ) {
                this.maxZ = z;
            }
        }
        grid.set( x, y, val );
        this._updateBounds( grid );
    }

    forEach( cb ) {
        for ( let z = this.minZ; z <= this.maxZ; ++z ){
            for ( let y = this.minY; y <= this.maxY; ++y ) {
                for ( let x = this.minX; x <= this.maxX; ++x ) {
                    cb( this.get( x, y, z ), x, y, z );
                }
            }
        }
    }

    print( tilemap ) {
        let mapper = tilemap || ( v => v );
        if ( typeof ( tilemap ) === "string" ) {
            mapper = v => tilemap[v];
        }

        for ( let z = this.minZ; z <= this.maxZ; ++z ) {
            console.log( `Level ${z}:` );
            for ( let y = this.minY; y <= this.maxY; ++y ) {
                let result = "";
                for ( let x = this.minX; x <= this.maxX; ++x ) {
                    result += mapper( this.get( x, y, z ) );
                }
                console.log( result );
            }
            console.log( "" );
        }
    }

    _updateBounds( grid ) {
        if ( grid.minX < this.minX ) {
            this.minX = grid.minX;
        }
        if ( grid.maxX > this.maxX ) {
            this.maxX = grid.maxX;
        }
        if ( grid.minY < this.minY ) {
            this.minY = grid.minY;
        }
        if ( grid.maxY > this.maxY ) {
            this.maxY = grid.maxY;
        }
    }
}

module.exports = Block;