const Cpu = require("./cpu.js");
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
} );

rl.question( "Input program: ", answer => {
    const cpu = new Cpu( answer );
    cpu.run();
    console.log( cpu.memory );
    rl.close();
} );