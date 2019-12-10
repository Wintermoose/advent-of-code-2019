const fs = require( "fs" );
const Grid = require( "./grid" );
const gcd = require( "./gcd" );
let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const content = fs.readFileSync( filename, { encoding: "utf8" } );
const grid = new Grid( content );

let bestVisible = 0;
let bestX = -1;
let bestY = -1;

function testVisible( x, y ) {
    let visible = 0;
    let maxRadius = Math.max( Math.max( y, grid.height - y - 1 ), Math.max( x, grid.width - x - 1 ) );
    let rays = {};

    const testAt = function ( gridX, gridY, gcd ) {
        if ( !grid.get( x + gridX, y + gridY ) ) return;
        const fx = gridX / gcd;
        const fy = gridY / gcd;
        const key = fx + "_" + fy;
        if ( rays[key] ) return;
        rays[key] = true;
        ++visible;
    }

    // draw concentric squares
    for ( let radius = 1; radius <= maxRadius; ++radius ) {
        for ( step = 0; step <= radius; ++step ) {
            // Note: we don't bother culling, as the grid will simple return false outside the bounds
            const cd = gcd( step, radius );
            // we test up to 8 directions here. Following the compass. Anticlockwise from bott
            // No need to make sure there are no overlaps, the code handles that automatically
            // S-SE
            testAt( step, radius, cd );
            // E-SE
            testAt( radius, step, cd );
            // E-NE
            testAt( radius, -step, cd );
            // N - NE
            testAt( step, -radius, cd );
            // N - NW
            testAt( -step, -radius, cd );
            // W - NW
            testAt( -radius, -step, cd );
            // W - SW
            testAt( -radius, step, cd );
            // S - SW
            testAt( -step, radius, cd );
        }
    }

    return visible;
}

for ( let testY = 0; testY < grid.height; ++testY ) {
    for ( let testX = 0; testX < grid.width; ++testX ) { 
        if ( !grid.get( testX, testY ) ) continue;
        const visible = testVisible( testX, testY );
        if ( visible > bestVisible ) {
            bestVisible = visible;
            bestX = testX;
            bestY = testY;
        }
    }
}

console.log( `We can see ${bestVisible} asteroids out of (${bestX}, ${bestY})` );