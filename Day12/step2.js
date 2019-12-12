const fs = require( "fs" );
const Moon = require( "./moon" );
const lcm = require( "./lcm" );

let filename = "puzzle.txt";
const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const moons = content
    .replace( /\r/g, "" )
    .split( "\n" )
    .filter( p => !!p )
    .map( line => {
        const moon = new Moon();
        moon.parse( line );
        moon.print();
        return moon;
    } )


const state = {};
const cycles = [0, 0, 0];
let todo = 3;
moons.forEach( (m,i) => {
    state[i] = [m.position[0], m.position[1], m.position[2]];
} )

let step = 0;
while ( todo ) {
    if ( (step+1) % 10000 === 0 ) console.log( `Step ${step + 1}` );

    for ( let i = 0; i < moons.length - 1; ++i ) {
        for ( j = i + 1; j < moons.length; ++j ) {
            moons[i].updateGravity( moons[j] );
        }
    }

    for ( i = 0; i < moons.length; ++i ) {
        moons[i].updatePosition();
    }

    ++step;
    for ( let coord = 0; coord < 3; ++coord ) {
        if ( cycles[coord] ) continue;
        let allMatch = true;
        for ( let i = 0; i < moons.length; ++i ) {
            const original = state[i];
            const moon = moons[i];
            if ( moon.velocity[coord] !== 0 || moon.position[coord] !== original[coord] ) {
                allMatch = false;
                break;
            }
        }
        if ( allMatch ) {
            cycles[coord] = step;
            --todo;
        }
    }
}

console.log( "Periods for each coordinate: ", cycles );

console.log( "Steps until the state repeates:", lcm(cycles) );
