const fs = require( "fs" );
const filename = "input.txt";

function parseSIF( content ) {
    const parts = content.replace(/\r/g,"").split( "\n" );
    const width = +parts[0];
    const height = +parts[1];
    const colors = parts[2];
    const layers = [];
    let layer;
    let x = 0;
    let y = height;
    
    colors.split("").forEach( color => {
        if ( y === height ) {
            x = 0;
            y = 0;
            layer = [];
            layers.push( layer );
            for ( let i = 0; i < height; ++i ) layer[i] = [];
        }
        layer[y][x] = +color;
        x += 1;
        if ( x === width ) {
            x = 0;
            y += 1;
        }
    });

    return { width, height, layers };
}

function createLayer( width, height, color ) {
    const result = [];
    for ( y = 0; y < height; ++y ) {
        const row = [];
        for ( x = 0; x < width; ++x ) row[x] = color;
        result[y] = row;
    }
    return result;
}

function renderLayer( width, height, layer, target ) {
    for ( y = 0; y < height; ++y ) {
        const src = layer[y];
        const trg = target[y];
        for ( x = 0; x < width; ++x ) {
            if ( trg[x] === 2 ) trg[x] = src[x];
        }
    }
}

function mergeLayers( width, height, layers ) {
    const result = createLayer( width, height, 2 );
    layers.forEach( layer => renderLayer( width, height, layer, result ) );
    return result;
}

function print( layer ) {
    mapping = " #.";
    layer.forEach( row => {
        let pixels = "";
        row.forEach( pixel => pixels += mapping[pixel] );
        console.log( pixels );
    })
}

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const { width, height, layers } = parseSIF( content );
console.log( `${width} x ${height}, ${layers.length} layers` );

const result = mergeLayers( width, height, layers );
print( result );

