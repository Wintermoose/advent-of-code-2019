const fs = require( "fs" );
const readline = require( "readline" );
const Grid = require( "./grid" );

let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

rl.on( "SIGINT", () => {
    rl.close();
    console.log( "Break!" );
} )

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const grid = new Grid( content, false );
grid.forEach( ( v, x, y ) => grid.set( x, y, v === "#" ? true : false ) );

const print = ( grid, clear ) => {
    if ( clear ) {
        readline.cursorTo( process.stdout, 0, 0 );
        readline.clearScreenDown();
    }
    grid.print( v => v ? "#" : "." );
}

function countNeighbours( grid, x, y ) {
    let count = 0;
    if ( grid.get( x, y - 1 ) )++count;
    if ( grid.get( x, y + 1 ) )++count;
    if ( grid.get( x - 1, y ) )++count;
    if ( grid.get( x + 1, y ) )++count;
    return count;
}

function runStep( grid ) {
    const newGrid = new Grid( "", false );
    grid.forEach( ( v, x, y ) => {
        const count = countNeighbours( grid, x, y );
        if ( v ) {
            newGrid.set( x, y, count === 1 );
        } else {
            newGrid.set( x, y, count >= 1 && count <= 2 );
        }
    } )
    return newGrid;
}

function getRating( grid ) {
    let rating = 0;
    let weight = 1;
    grid.forEach( ( v, x, y ) => {
        if ( v ) rating |= weight;
        weight *= 2;
    } )
    return rating;
}

function runSimulation( grid ) {
    let step = 0;
    let ratings = [];
    let lookup = {};
    while ( true ) {
        const rating = getRating( grid );
        ratings[step] = rating;
        if ( lookup[rating] !== undefined ) {
            console.log( `Found match between step ${step} and ${lookup[rating]}: ${rating}` );
            print( grid );
            break;
        }
        lookup[rating] = step;
        step += 1;
        grid = runStep( grid );
    }
}


runSimulation( grid );
rl.close();