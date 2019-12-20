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

    let cx = ( grid.maxX + grid.minX ) / 2;
    let cy = ( grid.maxY + grid.minY ) / 2;

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
                        ty: y,
                        distance: (x - cx)**2 + ( y - cy)**2
                    } );
                }
            }
        }
    } );

    let tunnels = {};

    Object.values( portals ).forEach( pair => {
        const deeper0 = pair[0].distance < pair[1].distance;
        tunnels[`${pair[0].x}_${pair[0].y}`] = pair[1];
        tunnels[`${pair[1].x}_${pair[1].y}`] = pair[0];
        pair[0].level = deeper0 ? 1 : -1;
        pair[1].level = deeper0 ? -1 : 1; 
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

function breathFirst( grid, sx, sy, ex, ey, tunnels ) {
    const queue = [{
        x: sx,
        y: sy,
        path: [{ x: sx, y: sy, level: 0 }],
        length: 0,
        level: 0
    }];
    const visited = [new Set()];
    visited[0].add( `${sx}_${sy}` );

    const deltas = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    while ( queue.length ) {
        //console.log( queue[0] );
        const { x, y, path, length, level } = queue.shift();
        if ( level > 200 ) {
            console.log( "Reached level 200, not allowing any more" );
            continue;
        }
        if ( x === ex && y === ey && level === 0 ) return { length, path };
        for ( let direction = 0; direction < 4; ++direction ) {
            const nx = x + deltas[direction].x;
            const ny = y + deltas[direction].y;
            const char = grid.get( nx, ny );
            if ( char === nWALL ) continue;
            const key = `${nx}_${ny}`;
            if ( !visited[level] ) visited[level] = new Set();
            if ( visited[level].has(key) ) continue;
            visited[level].add( key );
            if ( char === nEMPTY ) {
                queue.push( {
                    x: nx,
                    y: ny,
                    length: length + 1,
                    level,
                    path: [ ...path, {x: nx, y: ny, level } ]
                } );
            } else {
                let target = tunnels[key];
                if ( !target ) {
                    if ( x === sx && y === sy ) continue; //wall
                    if ( x === ex && y === ey && level > 0 ) continue; //wall
                    console.log( `Expected portal at ${nx}, ${ny}!` );
                    console.log( path );
                    return;
                }
                if ( level - target.level < 0 ) continue; //cannot go to above outermost level, so this is a wall
                queue.push( {
                    x: target.tx,
                    y: target.ty,
                    length: length + 1,
                    level: level - target.level,
                    path: [...path, { x: target.tx, y: target.ty, label: target.label, level: level - target.level }]
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
//console.log( portals );
//console.log( tunnels );
console.log( `${sx}, ${sy} -> ${ex}, ${ey}` );
const { length, path } = breathFirst( grid, sx, sy, ex, ey, tunnels );
//console.log( path );
if ( length < 0 ) {
    console.log( "Path not found" );
} else {
    console.log( `We needed ${length} steps` );
}
//console.log( getMaze() );