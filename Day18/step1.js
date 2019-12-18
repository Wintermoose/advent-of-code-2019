const fs = require( "fs" );
const Grid = require( "./grid" );
let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const nEMPTY = '.';
const nWALL = '#';

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const grid = new Grid( content, nWALL );
const deltas = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
let px = 0;
let py = 0;
let keys = [];
let keyMap = {};

function gatherInfo() {
    grid.forEach( ( ch, x, y ) => {
        if ( ch === "@" ) {
            px = x;
            py = y;
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
function findPath( x, y, bag, depth, path ) {
    const missingKeys = keys.filter( v => !bag[v] ).sort().join( "," );
    const cacheKey = grid.get( x, y ) + ":" + missingKeys;
    if ( cache[cacheKey] ) return cache[cacheKey];

    depth = depth || 0;
    //if ( depth < 5 )console.log( "findPath(", x, y, bag, ")" );
    const distances = new Grid( "", 1e+30 );
    floodfill( distances, bag, x, y, 0 );
    let bestDistance = 1e+30;
    let bestPath = [];
    let allFound = true;
    for ( const key of keys ) {
        if ( bag[key] ) continue;
        allFound = false;
        const { x: kx, y: ky } = keyMap[key];
        const keyDistance = distances.get( kx, ky );
        if ( keyDistance === 1e+30 ) continue;
        const next = findPath( kx, ky, { ...bag, [key]: true }, depth + 1, [...path, key] );
        if ( next.distance === 1e+30 ) continue;
        const distance = distances.get( kx, ky ) + next.distance;
        if ( distance < bestDistance ) {
            bestDistance = distance;
            bestPath = [key, ...next.path];
        }
    }
    if ( allFound ) {
        bestDistance = 0;
        bestPath = [];
    }
    return cache[cacheKey] = {
        distance: bestDistance,
        path: bestPath
    };
}

gatherInfo();
console.log( px, py, grid.get( px, py ) );
//console.log( ">", hasLoops( px, py, null, {} ) );
grid.print();
keys.sort();
console.log( px, py, keyMap );
const { distance, path } = findPath( px, py, {}, 0, [] );
console.log( `It is necessary to take ${distance} steps` );
console.log( `The keys should be taken in this order: ${path.join( ', ' )}` );
//console.log( cache );
