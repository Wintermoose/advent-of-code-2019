const Maze = require( "./maze.js" );
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
    prompt: "Input trace: "
} );

const maze = new Maze();
let index = 1;

rl.prompt();

rl.on( "line", answer => {
    if ( answer === "" ) {
        rl.close();
        return;
    }

    console.log( `Tracing wire ${index}\n` );
    const { distance, x, y } = maze.trace( answer, index++ );
    //maze.print();
    if ( distance !== null ) {
        console.log( `Distance ${distance} at ${x}, ${y}` );
    }
    rl.prompt();
} );