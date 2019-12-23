const fs = require( "fs" );
const Cpu = require( "./cpu.js" );
const filename = "input.txt";
const readline = require( "readline" );
const COUNT = 50;

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout,
} );

rl.on( "SIGINT", () => {
    rl.close();
    console.log( "Break!" );
} )

const program = fs.readFileSync( filename, { encoding: "utf8" } );

const states = [];
let natBuf = null;

for ( let i = 0; i < 50; ++i ) {
    const state = states[i] = {
        queue: [],
        iState: 0,
        oState: 0,
        address: i,
        oBuffer: [],
        idle: false
    }

    state.cpu = new Cpu( program );
    state.cpu.configure( {
        inputFn: cb => {
            if ( state.iState === 0 ) {
                state.iState = 1;
                console.log( `Address to ${i} is ${state.address}` );
                cb( state.address );
            } else if ( state.iState === 1 ) {
                if ( state.queue.length === 0 ) {
                    cb( -1 );
                    state.idle = true;
                } else {
                    state.iState = 2;
                    cb( state.queue[0].x );
                }
            } else {
                const val = state.queue[0].y;
                state.queue.shift();
                state.iState = 1;
                cb( val );
            }
        },

        outputFn: val => {
            state.oBuffer[state.oState++] = val;
            state.idle = false;
            if ( state.oState === 3 ) {
                state.oState = 0;
                const address = state.oBuffer[0];
                if ( address < COUNT ) {
                    states[address].queue.push( { x: state.oBuffer[1], y: state.oBuffer[2] } );
                } else {
                    console.log( `${state.oBuffer[1]}, ${state.oBuffer[2]} -> ${state.oBuffer[0]}` );
                    natBuf = { x: state.oBuffer[1], y: state.oBuffer[2] };
                }
            }
        }
    } );
};

let robin = 0;
let lastY = null;
function run() {
    states[robin].cpu.step( () => {
        robin = ( robin + 1 ) % COUNT;
        if ( robin === 0 ) {
            if ( natBuf && states.filter( s => s.idle ).length === COUNT ) {
                states[0].queue.push( natBuf );
                console.log( `NAT ${natBuf.x}, ${natBuf.y}` );
                if ( lastY === natBuf.y ) {
                    console.log( lastY );
                    return;
                }
                lastY = natBuf.y;
                natBuf = null;
            }
        }
        Promise.resolve().then( run );
    } ); 
}

run();