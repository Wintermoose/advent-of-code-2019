const fs = require( "fs" );
const readline = require( "readline" );
const Grid = require( "./grid" );
const Block = require( "./block" );

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
const block = new Block( [grid], false );

const print = ( block, clear ) => {
    if ( clear ) {
        readline.cursorTo( process.stdout, 0, 0 );
        readline.clearScreenDown();
    }
    block.print( v => v ? "#" : "." );
}

function countNeighbours( block, x, y, z ) {
    let count = 0;
    if ( x === 2 && y === 3 ) {
        if ( block.get( 0, 4, z + 1 ) )++count;
        if ( block.get( 1, 4, z + 1 ) )++count;
        if ( block.get( 2, 4, z + 1 ) )++count;
        if ( block.get( 3, 4, z + 1 ) )++count;
        if ( block.get( 4, 4, z + 1 ) )++count;
    } else if ( y === 0 ) {
        if ( block.get( 2, 1, z - 1 ) )++count;
    } else {
        if ( block.get( x, y - 1, z ) )++count;
    }

    if ( x === 2 && y === 1 ) {
        if ( block.get( 0, 0, z + 1 ) )++count;
        if ( block.get( 1, 0, z + 1 ) )++count;
        if ( block.get( 2, 0, z + 1 ) )++count;
        if ( block.get( 3, 0, z + 1 ) )++count;
        if ( block.get( 4, 0, z + 1 ) )++count;
    } else if ( y === 4 ) {
        if ( block.get( 2, 3, z - 1 ) )++count;
    } else {
        if ( block.get( x, y + 1, z ) )++count;
    }

    if ( x === 3 && y === 2 ) {
        if ( block.get( 4, 0, z + 1 ) )++count;
        if ( block.get( 4, 1, z + 1 ) )++count;
        if ( block.get( 4, 2, z + 1 ) )++count;
        if ( block.get( 4, 3, z + 1 ) )++count;
        if ( block.get( 4, 4, z + 1 ) )++count;
    } else if ( x === 0 ) {
        if ( block.get( 1, 2, z - 1 ) )++count;
    } else {
        if ( block.get( x - 1, y, z ) )++count;
    }

    if ( x === 1 && y === 2 ) {
        if ( block.get( 0, 0, z + 1 ) )++count;
        if ( block.get( 0, 1, z + 1 ) )++count;
        if ( block.get( 0, 2, z + 1 ) )++count;
        if ( block.get( 0, 3, z + 1 ) )++count;
        if ( block.get( 0, 4, z + 1 ) )++count;
    } else if ( x === 4 ) {
        if ( block.get( 3, 2, z - 1 ) )++count;
    } else {
        if ( block.get( x + 1, y, z ) )++count;
    }
    return count;
}

function getGridBugCount( block, z ) {
    const grid = block.grids[z];
    let count = 0;
    if ( grid ) {
        grid.forEach( v => { if ( v )++count; } );
    }
    return count;
}

function runStep( block ) {
    if ( getGridBugCount( block, block.minZ ) ) block.set( 0, 0, block.minZ - 1, false );
    if ( getGridBugCount( block, block.maxZ ) ) block.set( 0, 0, block.maxZ + 1, false );
    const newBlock = new Block( null, false );
    block.forEach( ( v, x, y, z ) => {
        if ( x === 2 && y === 2 ) return;
        const count = countNeighbours( block, x, y, z );
        if ( v ) {
            newBlock.set( x, y, z, count === 1 );
        } else {
            newBlock.set( x, y, z, count >= 1 && count <= 2 );
        }
    } )
    return newBlock;
}

function countBugs( block ) {
    let count = 0;
    block.forEach( v => {
        if ( v ) count++;
    } );
    return count;
}

function runSimulation( block ) {
    let step = 0;
    while ( true ) {
        step += 1;
        block = runStep( block );
        console.log( `--- Step ${step} ---` );
        //print( block );
        console.log( countBugs( block ) );
        if ( step === 200) return;
    }
}

print( block );
runSimulation( block );
rl.close();