const fs = require( "fs" );
const Grid = require( "./grid" );
const Cpu = require("./cpu.js");
const filename = "input.txt";
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
} );

const program = fs.readFileSync( filename, { encoding: "utf8" } );

const cpu = new Cpu( program );
cpu.memory[0] = 2n;
const grid = new Grid( "" );

let drawPhase = 0;
let drawX = 0;
let drawY = 0;
let score = 0;
let ballX = 0;
let paddleX = 0;

cpu.configure( {
    inputFn: cb => {
       readline.cursorTo( process.stdout, 0, 0 );
       readline.clearScreenDown();
       grid.print();
        console.log( score );
        let val = 0;
        if ( paddleX > ballX ) {
            val = -1;
        } else if ( paddleX < ballX ) {
            val = 1;
        }
        cb( val );
    },
    outputFn: val => {
        switch ( drawPhase ) {
            case 0:
                drawX = val;
                drawPhase = 1;
                break;
            case 1:
                drawY = val;
                drawPhase = 2;
                break;
            case 2:
                if ( drawX === -1n && drawY === 0n ) {
                    score = val;
                } else {
                    if ( val === 4n ) ballX = drawX;
                    if ( val === 3n ) paddleX = drawX;
                    grid.set( drawX, drawY, val );
                }
                drawPhase = 0;
        }
    },
    onDone: () => {
        grid.print();
        console.log( score );
        let blocks = 0;
        grid.forEach( b => blocks += b === 2n ? 1 : 0 );
        console.log( `${blocks} blocks` );
        rl.close();
    }
} );

cpu.run();