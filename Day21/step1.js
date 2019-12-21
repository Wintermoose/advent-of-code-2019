const fs = require( "fs" );
const Cpu = require( "./cpu.js" );
const Terminal = require( "./terminal" );
const filename = "input.txt";
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

rl.on( "SIGINT", () => {
    rl.close();
    console.log( "Break!" );
} )

const program = fs.readFileSync( filename, { encoding: "utf8" } );

function cleanup( code ) {
    return code.replace( /\r/g, "" ).split( "\n" ).filter( p => !!p ).map( l => l.trim() ).join( "\n" ) + "\n";
}

const print = ( grid, clear ) => {
    if ( clear ) {
        readline.cursorTo( process.stdout, 0, 0 );
        readline.clearScreenDown();
    }
    grid.print( v => String.fromCharCode(v) );
}

function run( sprintcode, onDone ) {
    const cpu = new Cpu( program );
    sprintcode = cleanup( sprintcode ).split("");
    const terminal = new Terminal();

    cpu.configure( {
        inputFn: cb => {
            const ch = sprintcode.shift();
            terminal.store( ch.charCodeAt( 0 ) );
            cb( ch.charCodeAt(0) );
        },
        outputFn: val => {
            if ( val >= 0n && val <= 255n ) {
                terminal.store( val );                
            } else {
                console.log( `Final result is ${val}` );
            }
        },
        onDone: () => {
            console.log( "DONE" );
            onDone();
        }
    } );

    cpu.run();
}

// D && !(A && BB && C)
const sprintcode = `
    OR B J
    AND A J
    AND C J
    NOT J J
    AND D J
    WALK
`;
// D && !(A && BB && C) && (H || E)
const sprintcode2 = `
    OR A J
    AND B J
    AND C J
    NOT J J
    AND D J
    OR H T
    OR E T
    AND T J
    RUN
`;
run( sprintcode2, () => {
    rl.close();
} );