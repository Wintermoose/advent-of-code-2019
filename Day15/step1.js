const fs = require( "fs" );
const Grid = require( "./grid" );
const Cpu = require("./cpu.js");
const filename = "input.txt";
const readline = require( "readline" );

const nUNKNOWN = 0;
const nEMPTY = 1;
const nWALL = 2;
const nOXYGEN = 3;

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

rl.on( "SIGINT", () => {
    rl.close();
    console.log( "Break!" );
} )

const program = fs.readFileSync( filename, { encoding: "utf8" } );

const cpu = new Cpu( program );
const grid = new Grid( "" );
const onPath = new Grid( "" );
const distances = new Grid( "" );
const oxygen = new Grid( "" );
onPath.set( 0, 0, true );
const deltas = [undefined, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
const reverse = [undefined, 2, 1, 4, 3];
const stack = [{ x: 0, y: 0, phase: 1, revert: 0 }];
let oxygenX, oxygenY;
let nextCommand = 1;
let returning = false;
let step = 0;


const print = () => {
    return;
    readline.cursorTo( process.stdout, 0, 0 );
    readline.clearScreenDown();
    const frame = stack[stack.length - 1];
    let oldCenter = grid.get( 0, 0 );
    grid.set( 0, 0, 5 );
    let old = frame && grid.get( frame.x, frame.y );
    if ( stack.length ) {
        grid.set( frame.x, frame.y, 4 );
    }
    grid.print( " .#oD+" );
    if ( stack.length ) {
        grid.set( frame.x, frame.y, old );
    }
    grid.set( 0, 0, oldCenter );
}

const pickNextDirection = () => {
    const frame = stack[stack.length - 1];
    let found = false;
    // try to find the next direction to go to
    while ( true ) {
        frame.phase += 1;
        if ( frame.phase === 5 ) break;
        const nextDelta = deltas[frame.phase];
        const nx = frame.x + nextDelta.x;
        const ny = frame.y + nextDelta.y;
        const gridPixel = grid.get( nx, ny );
        // Do not step over own path, and go only to unexplorer locations
        if ( !onPath.get( nx, ny ) && gridPixel === nUNKNOWN ) {
            found = true;
            break;
        }
    }
    if ( found ) {
        nextCommand = frame.phase;
        returning = false;
    } else {
        // go back in stack
        nextCommand = frame.revert;
        onPath.set( frame.x, frame.y, false );
        stack.pop();
        returning = true;
    }
}

const handleStep = (response) => {
    //console.log( "Response was ", response );
    switch ( response ) {
        case 0n:
            {
                // mark wall
                const frame = stack[stack.length - 1];
                let delta = deltas[nextCommand];
                grid.set( frame.x + delta.x, frame.y + delta.y, nWALL );
            }
            break;
        case 1n:
        case 2n:
            {
                // create enw stack entry and mark empty space or oxygen
                if ( !returning ) {
                    const oldFrame = stack[stack.length - 1];
                    const delta = deltas[nextCommand];
                    const nx = oldFrame.x + delta.x;
                    const ny = oldFrame.y + delta.y
                    stack.push( {
                        x: nx,
                        y: ny,
                        phase: 0,
                        revert: reverse[nextCommand]
                    } );
                    grid.set( nx, ny, response === 2n ? nOXYGEN : nEMPTY )
                    if ( response === 2n ) {
                        oxygenX = nx;
                        oxygenY = ny;
                    }
                    onPath.set( nx, ny, true );
                }
                break;
            }
    }
    pickNextDirection();
    //console.log( "Next direction is ", nextCommand );
}

function spreadDistances( x, y, depth, target, originX, originY ) {
    target.set( x, y, depth );
    for ( let direction = 1; direction <= 4; ++direction ) {
        const delta = deltas[direction];
        const nx = x + delta.x;
        const ny = y + delta.y;
        // Since we don't init the grid to MAXINT, we need to make sure not to cross origin (which is always 0) again
        if ( nx === originX && ny === originY ) continue;
        const d = target.get( nx, ny );
        if ( grid.get( nx, ny ) !== nWALL && ( d === 0 || d > depth + 1 ) ) spreadDistances( nx, ny, depth + 1, target, originX, originY );
    }
}

cpu.configure( {
    inputFn: cb => {
        if ( ( ++step ) % 10000 === 0 ) {
            print();
            console.log( `Step ${step}` )
            rl.question( "Continue? ", answer => {
                cb( answer === "n" ? 0 : nextCommand );
            } )
        } else {
            cb( nextCommand )
        }
    },
    outputFn: val => {
        handleStep( val );
        print();
    },
    onDone: () => {
        rl.close();
        console.log( `Found oxygen at ${oxygenX}, ${oxygenY}` );
        spreadDistances( 0, 0, 0, distances, 0, 0 );
        //distances.set( 0, 0, -100 );
        //distances.set( oxygenX, oxygenY, -200 );
        //distances.dump();
        console.log( `Distance to oxygen is ${distances.get( oxygenX, oxygenY )} ` );
        spreadDistances( oxygenX, oxygenY, 0, oxygen, oxygenX, oxygenY );
        //oxygen.set( oxygenX, oxygenY, -200 );
        //oxygen.dump();
        let maxTime = 0;
        oxygen.forEach( val => maxTime = Math.max( maxTime, val ) );
        console.log( `It will take ${maxTime} minutes to fill the area with oxygen ` );
    }
} );

cpu.run();