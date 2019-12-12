const fs = require( "fs" );
const Moon = require( "./moon" );

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
    
for ( let step = 0; step < 1000; ++step ) {
    for ( i = 0; i < moons.length - 1 ; ++i ) {
        for ( j = i + 1; j < moons.length; ++j ) {
            moons[i].updateGravity( moons[j] );
        }
    }

    console.log( `Step ${i + 1}` );
    let energy = 0;
    for ( i = 0; i < moons.length; ++i ) {
        moons[i].updatePosition();
        moons[i].print();
        energy += moons[i].getPot() * moons[i].getKit();
    }
    console.log( `Energy is ${energy}` );
}