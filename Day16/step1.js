const fs = require( "fs" );
let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}
const input = fs.readFileSync( filename, { encoding: "utf8" } ).split("\n")[0].trim();

function *pattern( level ) {
    const patternBase = [0, 1, 0, -1];
    let pos = level === 0 ? 1 : 0;
    let step = level === 0 ? 1 : level;
    while ( true ) {
        yield patternBase[pos];
        --step;
        if ( step === 0 ) {
            step = level + 1;
            ++pos;
            if ( pos === patternBase.length ) pos = 0;
        }
    }
}

function doStep( input ) {
    let result = "";
    for ( i = 0; i < input.length; ++i ) {
        const iter = pattern( i );
        let sum = 0;
        for ( j = 0; j < input.length; ++j ) {
            sum += iter.next().value * input[j];
        }
        result += Math.abs( sum ) % 10;
    }
    return result;
}


let current = input;
for ( let i = 0; i < 100; ++i ) {
    console.log( `Phase ${i} value ${current}` );
    current = doStep( current );
}

console.log( `Final value ${current}` );
console.log( `Final rextract ${current.substring( 0, 8 )}` );