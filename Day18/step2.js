const fs = require( "fs" );
const Grid = require( "./grid" );
let filename = "puzzle2.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const nEMPTY = '.';
const nWALL = '#';

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const grid = new Grid( content, nWALL );
const deltas = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
const robots = [];
let keys = [];
let keyMap = {};

function gatherInfo() {
    grid.forEach( ( ch, x, y ) => {
        if ( ch === "@" ) {
            robots.push( {
                x,
                y
            } );
        } else if ( ch >= 'a' && ch <= 'z' ) {
            keyMap[ch] = {
                x,
                y
            };
            keys.push( ch );
        }
    } );
}

function floodfill( target, bag, x, y, depth ) {
    if ( target.get( x, y ) <= depth ) return;
    const char = grid.get( x, y );
    if ( char === nWALL ) return;
    if ( char >= 'A' && char <= 'Z' ) {
        if ( !bag[char.toLowerCase()] ) return;
    }
    target.set( x, y, depth );

    for ( let direction = 0; direction < 4; ++direction ) {
        const delta = deltas[direction];
        const nx = x + delta.x;
        const ny = y + delta.y;
        floodfill( target, bag, nx, ny, depth + 1 );
    }
}

/*
Idea: instead if floodfiling in every iteration, just cache all the paths (n*n) with list of requried keys.
      This would work easily only if there are no loops (which we here verified).
      But the code is fast enough as-is
function hasLoops( x, y, fromDirection, path ) {
    const char = grid.get( x, y );
    if ( char === nWALL ) return false;

    const key = x + "_" + y;    
    if ( path[key] ) {
        console.log( x, y, path );
        return true;
    }
    const newPath = { ...path };
    newPath[key] = true;
    for ( let direction = 0; direction < 4; ++direction ) {
        if ( fromDirection !== null && fromDirection % 2 === direction % 2 && direction !== fromDirection ) {
            continue;
        }
        const delta = deltas[direction];
        const nx = x + delta.x;
        const ny = y + delta.y;
        if ( hasLoops( nx, ny, direction, newPath ) ) return true;
    }
    return false;
}
*/

const cache = {};
function findPath( robots, bag, depth, path ) {
    const missingKeys = keys.filter( v => !bag[v] ).sort().join( "," );
    const cacheKey = robots.map( r => grid.get( r.x, r.y ) ).join(",") + ":" + missingKeys;
    if ( cache[cacheKey] ) return cache[cacheKey];

    depth = depth || 0;
    if ( depth < 7 )console.log( cacheKey );
    const distanceMaps = robots.map( r => {
        const map = new Grid( "", 1e+30 );
        floodfill( map, bag, r.x, r.y, 0 );
        return map;
    } );
    let bestDistance = 1e+30;
    let bestPath = [];
    let bestSteps = [];
    let allFound = true;
    for ( const key of keys ) {
        if ( bag[key] ) continue;
        allFound = false;
        const { x: kx, y: ky } = keyMap[key];
        let robotIndex = -1;
        let keyDistance = 1e+30;
        for ( let i = 0; i < robots.length; ++i ) {
            keyDistance = distanceMaps[i].get( kx, ky );
            if ( keyDistance !== 1e+30 ) {
                robotIndex = i;
                break;
            }
        }
        if ( keyDistance === 1e+30 ) continue;
        const newRobots = robots.slice();
        newRobots[robotIndex] = {
            x: kx,
            y: ky
        };
        const next = findPath( newRobots, { ...bag, [key]: true }, depth + 1, [...path, key] );
        if ( next.distance === 1e+30 ) continue;
        const distance = keyDistance + next.distance;
        if ( distance < bestDistance ) {
            bestDistance = distance;
            bestPath = [key, ...next.path];
            bestSteps = [keyDistance, ...next.steps];
        }
    }
    if ( allFound ) {
        bestDistance = 0;
        bestPath = [];
        bestSteps = [];
    }
    return cache[cacheKey] = {
        distance: bestDistance,
        path: bestPath,
        steps: bestSteps
    };
}

gatherInfo();
//console.log( ">", hasLoops( px, py, null, {} ) );
grid.print();
keys.sort();
console.log( robots, keyMap );
const { distance, path, steps } = findPath( robots, {}, 0, [] );
console.log( `It is necessary to take ${distance} steps` );
console.log( `The keys should be taken in this order: ${path.join( ', ' )}` );
console.log( `The step lengths are ${steps.join(', ')}` );
//console.log( cache );
