class Maze {

    constructor() {
        this.clear();
    }

    clear() {
        this.field = [];
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }

    getState( x, y ) {
        const row = this.field[y];
        if ( !row ) return 0;
        return row[x] || 0;
    }

    setState( x, y, index ) {
        let row = this.field[y];
        if ( !row ) {
            row = this.field[y] = [];
        }
        row[x] = index;
        this.minX = Math.min( this.minX, x );
        this.minY = Math.min( this.minY, y );
        this.maxX = Math.max( this.maxX, x );
        this.maxY = Math.max( this.maxY, y );
    }

    getDistance( x, y ) {
        return Math.abs(x) + Math.abs(y);
    }

    trace( path, index ) {
        const commands = path.split( "," );
        let x = 0;
        let y = 0;
        let minD = null;
        let minX = 0;
        let minY = 0;

        const draw = ( sx, sy, length ) => {
            while ( length-- ) {
                if ( x !== 0 || y !== 0 ) {
                    const previous = this.getState( x, y );
                    if ( previous && previous !== index ) {
                        const distance = this.getDistance( x, y );
                        if ( minD === null || distance < minD ) {
                            minD = distance;
                            minX = x;
                            minY = y;
                        }
                    }

                    this.setState( x, y, index );
                }

                x += sx;
                y += sy;
            }
        }

        commands.forEach( command => {
            const direction = command[0];
            const length = +command.substring( 1 );
            switch ( direction ) {
                case "R":
                    draw( 1, 0, length );
                    break;
                case "L":
                    draw( -1, 0, length );
                    break;
                case "U":
                    draw( 0, 1, length );
                    break;
                case "D":
                    draw( 0, -1, length );
                    break;
                default:
                    console.error( `Unknown command ${command}` );
                    break;
            }
        } );

        return { distance: minD, x: minX, y: minY };
    }

    print() {
        
        const edge = () => {
            let result = "";
            for ( let i = this.minX - 1; i <= this.maxX + 1; ++i ) {
                result += "#";
            }
            console.log( result );
        }

        edge();
        for ( let y = this.maxY; y >= this.minY; --y ) {
            let result = "#";
            for ( let x = this.minX; x <= this.maxX; ++x ) {
                if ( x === 0 && y === 0 ) {
                    result += "O";
                } else {
                    const state = this.getState( x, y );
                    if ( state === 0 ) {
                        result += ".";
                    } else {
                        result += state;
                    }
                }
            }
            result += "#";
            console.log( result );
        }
        edge();
    }
}

module.exports = Maze;