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

function countColors( layer, color ) {
    return layer.reduce(
        ( sum, row ) => sum + row.reduce( ( inner, pixel ) => inner + ( pixel === color ? 1 : 0 ), 0 ),
        0
    );
}

function findLeastCountLayer( width, height, layers, color ) {
    let least = width * height;
    let bestLayer = null;
    layers.forEach( layer => {
        const count = countColors( layer, color );
        if ( count < least ) {
            least = count;
            bestLayer = layer;
        }
    } )

    return bestLayer;
}

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const { width, height, layers } = parseSIF( content );
console.log( `${width} x ${height}, ${layers.length} layers` );

const bestLayer = findLeastCountLayer( width, height, layers, 0 );
console.log( bestLayer );
console.log( countColors( bestLayer, 1 ) * countColors( bestLayer, 2 ) );
