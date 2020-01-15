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

function getPermutations( items ) {
    const result = [];
    const length = items.length;
    const permutations = 1 << length;
    for ( let i = 0; i < permutations; ++i ) {
        const entry = [];
        for ( let j = 0; j < length; ++j ) {
            if ( i & ( 1 << j ) ) entry.push( items[j] );
        }
        result.push( entry );
    }
    return result;
}

function gatherFullInventory( lines ) {
    let start = lines.indexOf( "Items in your inventory:" );
    let result = [];
    for ( let i = start + 1; i < lines.length; ++i ) {
        if ( lines[i].startsWith( "- " ) ) {
            result.push( lines[i].substring( 2 ) );
        } else {
            break;
        }
    }
    return result;
}

function getInventoryChange( current, next ) {
    const commands = [];
    const currentSet = new Set( current );
    const nextSet = new Set( next );
    for ( let i = 0; i < current.length; ++i ) {
        if ( !nextSet.has( current[i] ) ) {
            commands.push( "drop " + current[i] );
        }
    }
    for ( let i = 0; i < next.length; ++i ) {
        if ( !currentSet.has( next[i] ) ) {
            commands.push( "take " + next[i] );
        }
    }
    commands.push( "south" );
    return commands;
}

function run( onDone ) {
    const cpu = new Cpu( program );
    const terminal = new Terminal();

    // ok in theory we might want to make the maze search generic too, but this fits to my data
    let commands = [
        "south",
        "take mouse",
        "east",
        "take shell",
        "west",
        "west",
        "take whirled peas",
        "east",
        "north",
        "east",
        "south",
        "south",
        "take hologram",
        "north",
        "north",
        "west",
        "west",
        "north",
        "north",
        "west",
        "take semiconductor",
        "east",
        "south",
        "west",
        "south",
        "take hypercube",
        "north",
        "east",
        "south",
        "west",
        "take antenna",
        "south",
        "take spool of cat6",
        "north",
        "west",
        "south",
        "south"
    ];

    /*
    0 = gather
    1 = dump inventory
    2 = test combinations
    */
    let phase = 0;
    let fullInventory = null;
    let combinations;
    let currentInventory;

    terminal.setGetInputs( ( lines, cb ) => {
        
        const sendLine = ( input ) => {
            input = input.split( "" );
            if ( input.length ) input.push( "\n" );
            cb( input );
        }

        if ( commands.length ) {
            const line = commands.shift();
            console.log( line );
            sendLine( line );
        } else {
            switch ( phase ) {
                case 0:
                    phase = 1;
                    sendLine( "inv" );
                    break;
                case 1:
                    phase = 2;
                    currentInventory = fullInventory = gatherFullInventory( lines );
                    combinations = getPermutations( fullInventory );
                    //rl.question( ">", sendLine );
                    sendLine( "south" );
                    break;
                case 2:
                    {
                        const targetInventory = combinations.shift();
                        commands = getInventoryChange( currentInventory, targetInventory );
                        currentInventory = targetInventory;
                        sendLine( "?" );
                    }
                    break;
                default:
                    rl.question( ">", sendLine );
                    break;
            }
        }
    } );

    cpu.configure( {
        inputFn: cb => {
            terminal.read( cb );
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

run( () => {
    rl.close();
} );