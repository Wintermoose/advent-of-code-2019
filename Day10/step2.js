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
let bestRays = null;

function testVisible( x, y ) {
    let visible = 0;
    let maxRadius = Math.max( Math.max( y, grid.height - y - 1 ), Math.max( x, grid.width - x - 1 ) );
    let rays = {};

    const testAt = function ( gridX, gridY, gcd ) {
        if ( !grid.get( x + gridX, y + gridY ) ) return;
        const fx = gridX / gcd;
        const fy = gridY / gcd;
        const key = fx + "_" + fy;
        let asteroids = rays[key];
        if ( !asteroids ) {
            ++visible;
            rays[key] = asteroids = [];
        }
        asteroids.push( { x: x + gridX, y: y + gridY } );
    }

    // draw concentric squares
    for ( let radius = 1; radius <= maxRadius; ++radius ) {
        for ( step = 0; step <= radius; ++step ) {
            // Note: we don't bother culling, as the grid will simple return false outside the bounds
            const cd = gcd( step, radius );
            // we test up to 8 directions here. Following the compass. Anticlockwise from bottom
            // No overlaps please
            // S-SE
            testAt( step, radius, cd );
            // E-SE
            if ( step < radius ) testAt( radius, step, cd );
            // E-NE
            if ( step !== 0 ) testAt( radius, -step, cd );
            // N - NE
            if ( step < radius ) testAt( step, -radius, cd );
            // N - NW
            if ( step !== 0 ) testAt( -step, -radius, cd );
            // W - NW
            if ( step < radius ) testAt( -radius, -step, cd );
            // W - SW
            if ( step !== 0 ) testAt( -radius, step, cd );
            // S - SW
            if ( step < radius ) testAt( -step, radius, cd );
        }
    }

    return { rays, visible };
}

function findBest() {
    for ( let testY = 0; testY < grid.height; ++testY ) {
        for ( let testX = 0; testX < grid.width; ++testX ) {
            if ( !grid.get( testX, testY ) ) continue;
            const { rays, visible } = testVisible( testX, testY );
            if ( visible > bestVisible ) {
                bestVisible = visible;
                bestX = testX;
                bestY = testY;
                bestRays = rays;
            }
        }
    }
}

function eradicate( x, y, rays ) {
    let sortedRays = Object.values( rays ).map( asteroids => {
        const dx = asteroids[0].x - x;
        const dy = asteroids[0].y - y;
        let angle = Math.atan2( dx, -dy );
        if ( angle < 0 ) angle += Math.PI * 2;
        return { angle, dx, dy, asteroids };
    } );
    sortedRays.sort( ( r1, r2 ) => r1.angle - r2.angle );
    
    let hits = 0;
    while ( hits < 200 && sortedRays.length ) {
        sortedRays.forEach( ( { asteroids } ) => {
            ++hits;
            const victim = asteroids.shift();
            if ( hits === 200 ) {
                console.log( `Asteroid no.200 is at ${victim.x}, ${victim.y}` );
            }
        } );
        sortedRays = sortedRays.filter( ( { asteroids } ) => asteroids.length );
    }
}


findBest();
console.log( `We can see ${bestVisible} asteroids out of (${bestX}, ${bestY})` );

eradicate( bestX, bestY, bestRays );

