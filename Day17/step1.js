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

const isScaffold = ( grid, x, y ) => {
    const val = grid.get( x, y );
    return val !== '.'.charCodeAt(0) && val !== 0;
}

const isCrossing = ( grid, x, y ) => isScaffold( grid, x - 1, y ) && isScaffold( grid, x + 1, y ) && isScaffold( grid, x, y - 1 ) && isScaffold( grid, x, y + 1 );

function gatherScaffolding( onDone ) {
    const cpu = new Cpu( program );
    const grid = new Grid( "" );
    let cx = 0;
    let cy = 0;

    cpu.configure( {
        inputFn: cb => {
            cb( 0 );
        },
        outputFn: val => {
            val = Number( val );
            if ( val === 10 ) {
                cx = 0;
                cy += 1;
            } else {
                grid.set( cx, cy, val );
                cx += 1;
            }
        },
        onDone: () => {
            console.log( "Done" );
            let sum = 0;
            let count = 0;
            grid.forEach( ( _, x, y ) => {
                if ( isCrossing( grid, x, y ) ) {
                    const dist = x * y;
                    sum += dist;
                    ++count;
                }
            } )
            console.log( `Found ${count} crossings with total alignment parameters ${sum}` );
            onDone( grid );
            rl.close();
        }
    } );

    cpu.run();
}

function findBot( grid ) {
    let bx = -1; by = -1;
    let direction = -1;
    const botChars = ">v<^";
    grid.forEach( ( v, x, y ) => {
        const ch = String.fromCharCode( v );
        const pos = botChars.indexOf( ch );
        if ( pos !== -1 ) {
            bx = x;
            by = y;
            direction = pos;
        }
    } );

    return {
        x: bx,
        y: by,
        direction
    };
}

function findDesiredDirection( grid, x, y, direction ) {
    if ( direction !==3 && direction !== 1 && isScaffold( grid, x, y - 1 ) ) {
        return 3;
    } else if ( direction !== 0 && direction !== 2 && isScaffold( grid, x + 1, y ) ) {
        return 0;
    } else if ( direction !== 3 && direction !== 1 && isScaffold( grid, x, y + 1 ) ) {
        return 1;
    } else if ( direction !== 0 && direction !== 2 && isScaffold( grid, x -1, y ) ) {
        return 2;
    }
    return -1;
}

function getTurnDirection( direction, desiredDirection ) {
    if ( direction === desiredDirection ) return "";
    if ( direction % 2 === desiredDirection % 2 ) return "RR";
    if ( ( 4 + desiredDirection - direction ) % 4 === 1 ) return "R";
    return "L";
}

function findLine( grid, x, y, dx, dy ) {
    let length = 0;
    do {
        x += dx;
        y += dy;
        length += 1;
    } while ( isScaffold( grid, x, y ) );
    return length - 1;
}

function evaluateSize( path ) {
    const parts = {};
    let mainLine = "";
    let functions = 0;
    for ( const part of path ) {
        if ( part.toString().length > 20 ) return false;
        let letter = parts[part];
        if ( !letter ) {
            ++functions;
            if ( functions > 3 ) return false;
            parts[part] = letter = String.fromCharCode( 65 + functions - 1 );
        }
        if ( mainLine.length ) mainLine += ",";
        mainLine += letter;
        if ( mainLine.length > 20 ) return false;
    }
    return {
        main: mainLine,
        parts
    }
}

function same( a, b ) {
    if ( a.length !== b.length ) return false;
    for ( let i = 0; i < a.length; ++i ) {
        if ( a[i] !== b[i] ) return false;
    }
    return true;
}

function factor( path, depth ) {
    depth = depth || 0;
    let program = evaluateSize( path );
    if (  program ) {
        return program;
    }

    for ( let i = 0; i < path.length - 1; ++i ) {
        if ( path[i + 1].length > 2 ) continue; //add only 1 step at a time
        const copy = path.slice();
        let j = i;
        let merged = 0;
        while ( j < copy.length - 1 ) {
            if ( same( path[i], copy[j] ) && same( path[i + 1], copy[j + 1] ) ) {
                copy.splice( j, 1 );
                copy[j] = [...path[i], ...path[i + 1]];
                ++merged;
            }
            ++j;
        }
        if ( merged < 2 ) continue; //we always need to help at least 2 blocks
        const fine = factor( copy, depth + 1 );
        if ( fine ) {
            return fine;
        }
    }
    return false;
}

function gatherSteps( grid ) {
    const deltas = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    let { x, y, direction } = findBot( grid );
    let desiredDirection = findDesiredDirection( grid, x, y, -1);
    let path = [];
    let turn = getTurnDirection( direction, desiredDirection );
    direction = desiredDirection;
    while ( true ) {
        const { x:dx, y:dy } = deltas[direction];
        const length = findLine( grid, x, y, dx, dy );
        path.push([turn, length]);
        x += length * dx;
        y += length * dy;
        desiredDirection = findDesiredDirection( grid, x, y, direction );
        if ( desiredDirection === -1 ) break;
        turn = getTurnDirection( direction, desiredDirection );
        direction = desiredDirection;
    }
    console.log( "Factoring..." );
    const factorization = factor( path );
    if ( !factorization ) return false;
    const inverted = {};
    Object.entries( factorization.parts ).forEach( ( [key, val] ) => {
        inverted[val] = key;
    } )
    const program = [
        factorization.main,
        inverted["A"],
        inverted["B"],
        inverted["C"]
    ];
    return program;
}

function runProgram( searchProgram ) {
    const eol = String.fromCharCode( 10 );
    const showVideo = false;
    const inputs = ( searchProgram.join( eol ) + eol + ( showVideo ? "y" : "n" ) + eol ).split("");
    const cpu = new Cpu( program );
    cpu.memory[0] = 2n;
    const grid = new Grid( "" );
    let cx = 0;
    let cy = 0;
    let result = 0;

    cpu.configure( {
        inputFn: cb => {
            const char = inputs.shift();
            cb( char ? char.charCodeAt(0) : 0 );
        },
        outputFn: val => {
            if ( val < 255 ) {
                val = Number( val );
                if ( val === 10 ) {
                    if ( cx === 0 ) {
                        cy = 0;
                        print(grid, true);
                        console.log( `Robot gathered ${result} dust particles` );
                    } else {
                        cx = 0;
                        cy += 1;
                    } 
                } else {
                    grid.set( cx, cy, val );
                    cx += 1;
                }
            } else {
                console.log( result );
                result = val;
            }
        },
        onDone: () => {
            console.log( "Done" );
            print( grid );
            console.log( `Robot gathered ${result} dust particles` );
            console.log( searchProgram );
            rl.close();
        }
    } );

    cpu.run();    
}

gatherScaffolding( grid => {
    const program = gatherSteps( grid );
    if ( program ) {
        runProgram( program );
    } else {
        console.log( "Couldn't figure it out, sorry" );
    }
})