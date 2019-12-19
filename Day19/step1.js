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

function findBeam( onDone ) {
    const grid = new Grid( "" );
    let cx = 0;
    let cy = 0;

    const run = () => {
        testPoint( cx, cy, val => {
            grid.set( cx, cy, !!val );
            cx += 1;
            if ( cx === 50 ) {
                cx = 0;
                cy += 1;
                if ( cy === 50 ) {
                    grid.print( v => v ? "#" : '.');
                    return onDone( grid );
                }
            }
            Promise.resolve().then( run );
        } );
    }

    run();
}

findBeam( grid => {
    let cnt = 0;
    grid.forEach( val => cnt += val ? 1 : 0 );
    console.log( `Found ${cnt} points affected` );
    rl.close();
} );