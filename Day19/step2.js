const fs = require( "fs" );
const Grid = require( "./grid" );
const Cpu = require("./cpu.js");
const filename = "input.txt";
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

rl.on( "SIGINT", () => {
    rl.close();
    console.log( "Break!" );
} )

const program = fs.readFileSync( filename, { encoding: "utf8" } );

const print = ( grid, clear ) => {
    if ( clear ) {
        readline.cursorTo( process.stdout, 0, 0 );
        readline.clearScreenDown();
    }
    grid.print( v => String.fromCharCode(v) );
}

function testPoint( x, y, onDone ) {
    const cpu = new Cpu( program );
    let passY = false;
    let result;

    cpu.configure( {
        inputFn: cb => {
            if ( passY ) {
                passY = false;
                cb( y );
            } else {
                cb( x );
                passY = true;
            }
        },
        outputFn: val => {
            val = Number( val );
            result = !!val;
        },
        onDone: () => {
            onDone( result );
        }
    } );

    cpu.run();
}

function findBeam( grid, distance, xStart, yStart, yEnd, onDone ) {
    let cx = distance;
    let cy = yStart;
    let down = true;

    const run = () => {
        testPoint( cx, cy, val => {
            grid.set( cx, cy, !!val );
            if ( down ) {
                cy += 1;
                if ( cy > yEnd ) {
                    down = false;
                    cy -= 1;
                }
            }
            if ( !down ) {
                cx -= 1;
            }
            if ( cx < xStart ) {
                return onDone( grid );
            } else {
                run();
            }
        } );
    }

    run();
}

function findColumnRange( grid, x ) {
    let min = null;
    let max = null;
    let isIn = false;
    let y;
    for ( y = 0; y <= grid.maxY; ++y ) {
        const aff = grid.get( x, y );
        if ( !isIn ) {
            if ( aff ) {
                min = y;
                isIn = true;
            }
        } else {
            if ( !aff ) {
                max = y - 1;
                isIn = false;
                break;
            }
        }
    }
    if ( isIn ) max = y - 1;
    return { min, max };
}

function findRowRange( grid, y ) {
    let min = null;
    let max = null;
    let isIn = false;
    let x;
    for ( x = 0; x <= grid.maxX; ++x ) {
        const aff = grid.get( x, y );
        if ( !isIn ) {
            if ( aff ) {
                min = x;
                isIn = true;
            }
        } else {
            if ( !aff ) {
                max = x - 1;
                isIn = false;
                break;
            }
        }
    }
    if ( isIn ) max = x - 1;
    return { min, max };
}

function boxFits( grid, x, y, size ) {
    // check top row
    const { min: minX0, max: maxX0 } = findRowRange( grid, y );
  //  console.log( `T:${minX0} <= ${x - size + 1} <= ${maxX0}` );
    if ( minX0 > x - size + 1 || maxX0 < x - size + 1 ) return false;
    // check bottom row
    const { min: minX1, max: maxX1 } = findRowRange( grid, y + size - 1 );
//    console.log( `B:${minX1} <= ${x - size + 1} <= ${maxX1}` );
    if ( minX1 > x - size + 1 || maxX1 < x - size + 1 ) return false;
    return true;
}

function findLocation( boxSize, onDone ) {
    let distance = 0;
    let xStart = 0;
    let yStart = 0;
    let yEnd = distance;
    const grid = new Grid( "", 0 );
    const run = () => {
        console.log( distance );
        findBeam( grid, distance, xStart, yStart, yEnd , () => {
            const { min: minY, max: maxY } = findColumnRange( grid, distance );
            if ( minY !== null ) {
                yStart = minY;
                yEnd = maxY + 2; //assume no bigger jump than 2px
                const { min: minX, max: maxX } = findRowRange( grid, maxY );
                if ( minX !== null ) {
                    xStart = minX;
                    if ( boxFits( grid, distance, minY, boxSize ) ) {
                        return onDone( grid, distance, minY );
                    }
                }
            } else {
                yEnd = distance + 1;
            }
            ++distance;
            Promise.resolve().then( run );
        } );
    }
    run();
}

const size = 100;
findLocation( size, ( grid, x, y ) => {
    const x0 = x - size + 1;
    const x1 = x;
    const y0 = y;
    const y1 = y + size - 1;
    grid.forEach( ( v, px, py ) => {
        if ( px >= x0 && px <= x1 && py >= y0 && py <= y1 ) {
            if ( !v ) console.log( "Error" );
            grid.set( px, py, 2 );
        }
    } )
    grid.print( v => {
        if ( v === 0 ) return " ";
        if ( v === 2 ) return "o";
        return v ? "#" : "."
    })
    console.log( (x - size + 1) * 10000 + y );
    rl.close();
} );