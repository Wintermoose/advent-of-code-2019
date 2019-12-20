const fs = require( "fs" );
const Grid = require( "./grid" );


const nSPACE = ' ';
const nEMPTY = '.';
const nWALL = '#';

function getMaze() {
    let filename = "puzzle.txt";

    const args = process.argv.slice( 2 );
    if ( args.length === 1 ) {
        filename = args[0];
    }

    const content = fs.readFileSync( filename, { encoding: "utf8" } );

    const grid = new Grid( content, nSPACE );
    let sx = 0;
    let sy = 0;
    let ex = 0;
    let ey = 0;
    let portals = {};

    const isLetter = ( x, y ) => {
        const ch = grid.get( x, y );
        return ch >= 'A' && ch <= 'Z';
    }

    grid.forEach( ( ch, x, y ) => {
        if ( ch >= 'A' && ch <= 'Z' ) return;
        if ( ch === nEMPTY ) {
            let label = "";
            let lx = x, ly = y;
            if ( isLetter( x, y - 1 ) ) {
                label = grid.get( x, y - 2 ) + grid.get( x, y - 1 );
                ly = y - 1;
            } else if ( isLetter( x - 1, y ) ) {
                label = grid.get( x - 2, y ) + grid.get( x - 1, y );
                lx = x - 1;
            } else if ( isLetter( x + 1, y ) ) {
                label = grid.get( x + 1, y ) + grid.get( x + 2, y );
                lx = x + 1;
            } else if ( isLetter( x, y + 1 ) ) {
                label = grid.get( x, y + 1 ) + grid.get( x, y + 2 );
                ly = y + 1;
            }
            if ( label ) {
                if ( label === "AA" ) {
                    sx = x;
                    sy = y;
                } else if ( label === "ZZ" ) {
                    ex = x;
                    ey = y;
                } else {
                    let list = portals[label];
                    if ( !list ) list = portals[label] = [];
                    list.push( {
                        label,
                        x: lx,
                        y: ly,
                        tx: x,
                        ty: y
                    } );
                }
            }
        }
    } );

    let tunnels = {};
    Object.values( portals ).forEach( pair => {
        tunnels[`${pair[0].x}_${pair[0].y}`] = pair[1];
        tunnels[`${pair[1].x}_${pair[1].y}`] = pair[0];
    } );
    
    return {
        grid,
        sx,
        sy,
        ex,
        ey,
        portals,
        tunnels
    };
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

function breathFirst( grid, sx, sy, ex, ey, tunnels ) {
    const queue = [{
        x: sx,
        y: sy,
        path: [{ x: sx, y: sy }],
        length: 0
    }];
    const visited = new Set();
    visited.add( `${sx}_${sy}` );

    const deltas = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    while ( queue.length ) {
        //console.log( queue[0] );
        const { x, y, path, length } = queue.shift();
        if ( x === ex && y === ey ) return { length, path };
        for ( let direction = 0; direction < 4; ++direction ) {
            const nx = x + deltas[direction].x;
            const ny = y + deltas[direction].y;
            const char = grid.get( nx, ny );
            if ( char === nWALL ) continue;
            const key = `${nx}_${ny}`;
            if ( visited.has(key) ) continue;
            visited.add( key );
            if ( char === nEMPTY ) {
                queue.push( {
                    x: nx,
                    y: ny,
                    length: length + 1,
                    path: [ ...path, {x: nx, y: ny} ]
                } );
            } else {
                let target = tunnels[key];
                if ( !target ) {
                    if ( x == sx && y === sy ) continue;                    
                    console.log( `Expected portal at ${nx}, ${ny}!` );
                    console.log( path );
                    return;
                }
                queue.push( {
                    x: target.tx,
                    y: target.ty,
                    length: length + 1,
                    path: [...path, { x: target.tx, y: target.ty, label: target.label }]
                } );
            }
        }
    }
    return {
        length: -1,
        path: []
    }
}

const {grid, sx, sy, ex, ey, tunnels, portals} = getMaze();
grid.print();
console.log( portals );
console.log( tunnels );
console.log( `${sx}, ${sy} -> ${ex}, ${ey}` );
const { length, path } = breathFirst( grid, sx, sy, ex, ey, tunnels );
console.log( path );
console.log( `We needed ${length} steps` );
//console.log( getMaze() );