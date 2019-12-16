const fs = require( "fs" );
let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}
const input = fs.readFileSync( filename, { encoding: "utf8" } ).split( "\n" )[0].trim();

// Here we know the pattern consists only from the initial 0 and 1, so we can sum everything in one go
// This feels like a cheat, but it works for all the step2 test cases, including the final puzzle
function doStepFast( input, offset ) {
    let result = "";
    let sum = 0;
    for ( i = input.length - 1; i >= 0; --i ) {
        sum += input.charCodeAt( i ) - 48;
        result = ( Math.abs( sum ) % 10 ) + result;
    }
    return result;
}

function doStep( input, offset ) {
    if ( offset >= input.length ) return doStepFast( input, offset );
    let result = "";
    for ( i = 0; i < input.length; ++i ) {
        let sum = 0;
        let blockSize = offset + i + 1;
        let pos = i;
        let todo = input.length - pos;
        while ( todo > 0 ) {
            let j = Math.max( 0, Math.min( blockSize, todo ) );
            todo -= j;
            while ( j-- ) {
                sum += input.charCodeAt( pos ) - 48;
                ++pos;
            }
            pos += blockSize;
            todo -= blockSize;
            j = Math.max( 0, Math.min( blockSize, todo ) );
            todo -= j;
            while ( j-- ) {
                sum -= input.charCodeAt( pos ) - 48;
                ++pos;
            }
            pos += blockSize;
            todo -= blockSize;
        }
        result += Math.abs( sum ) % 10;
    }
    return result;
}



let offset = + input.substring( 0, 7 );
console.log( `Offset is ${offset}` );
let fullInput = "";
for ( let i = 0; i < 10000; ++i ) {
    fullInput += input;
}
fullInput = fullInput.substring( offset );
console.log( `${fullInput.length} digits` );

let current = fullInput;
for ( let i = 0; i < 100; ++i ) {
    console.log( `Phase ${i}` );
    current = doStep( current, offset );
}

console.log( `Final rextract ${current.substring( 0, 8 )}` );
