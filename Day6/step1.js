const Map = require( "./map.js" );
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
    prompt: "Input map: "
} );


const map = new Map();

rl.prompt();
rl.on( "line", answer => {
    if ( answer ) {
        map.addRelation( answer );
    } else {
        const crc = map.getCRC();
        console.log( `Map CRC is ${crc}` );
        const distance = map.getTransfers( "YOU", "SAN" );
        console.log( `${distance} orbital transfers are needed` );
        rl.close();
    }
} );