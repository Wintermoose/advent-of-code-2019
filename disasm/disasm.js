const decode = require( "./decode.js" );

const args = process.argv.slice( 2 );

if ( args.length !== 1 || args[0] === "/?" || args[0] === "-h" || args[0] === "--help" ) {
    console.log( "IntCode disassembler (day9 release)")
    console.log( "Usage:" );
    console.log( "  node disasm.js yourprogramcode" );
    return;
}

const memory = args[0]
    .split( "," )
    .map( v => v.trim() )
    .map( v => BigInt( v ) );

const addressPad = Math.ceil( Math.log10( memory.length ) );

let i = 0;
while ( i < memory.length ) {
    const address = i.toString().padStart( addressPad, " " );
    const { text, length } = decode( memory, i );
    const dump = "".padStart( addressPad, " " ) + "  // " + memory.slice( i, i + length ).join( ", " );
    console.log( dump )
    const row = `${address}: ${text}`;
    console.log( row );
    i += length;
}