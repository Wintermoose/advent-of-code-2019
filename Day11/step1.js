const fs = require( "fs" );
const Grid = require( "./grid" );
const Cpu = require("./cpu.js");
const filename = "input.txt";

const program = fs.readFileSync( filename, { encoding: "utf8" } );

const cpu = new Cpu( program );
const grid = new Grid( "" );
const touched = new Grid( "" );

let x = 0;
let y = 0;
let sx = 0;
let sy = -1;
let toPaint = true;
let painted = 0;

// step 2
grid.set( 0, 0, true );

cpu.configure( {
    inputFn: cb => cb( grid.get( x, y ) ? 1n : 0n ),
    outputFn: val => {
        if ( toPaint ) {
            const original = grid.get( x, y );
            grid.set( x, y, !!val );
            if ( !touched.get( x, y ) ) {
                ++painted;
                touched.set( x, y, true );
            }
            toPaint = false;
        } else {
            if ( val === 0n ) {
                const t = sy;
                sy = -sx;
                sx = t;
            } else {
                const t = sy;
                sy = sx;
                sx = -t;
            }
            x += sx;
            y += sy;
            //console.log( val, sx, sy, x, y );
            toPaint = true;
        }
    },
    onDone: () => {
        grid.print();
        //console.log( grid );
        console.log( `The robot painted ${painted} squares` );
    }
} );

cpu.run();