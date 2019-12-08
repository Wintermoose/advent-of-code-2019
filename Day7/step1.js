const Cpu = require("./cpu.js");
const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
} );

function runTest( program, settings, onDone ) {
    settings = settings.slice();
    let value = 0;

    const doStep = () => {
        if ( settings.length === 0 ) {
            onDone( value );
            return;
        }
        const config = settings.shift();
        const cpu = new Cpu( program );
        let inputIndex = -1;
//        console.log( `Config ${config} input ${value}` );
        cpu.configure( {
            inputFn: cb => {
                ++inputIndex;
                cb( inputIndex === 0 ? config : value );
            },
            outputFn: v => {
                value = v;
//                console.log( "Output ", v );
            },
            onDone: doStep
        } );

        cpu.run();
    }

    doStep();
}

function getPermutations( length ) {
    const result = [];
    const vars = [-1];
    let stack = 0;
    while ( true ) {
        while ( vars[stack] === length - stack - 1 ) {
            --stack;
            if ( stack < 0 ) return result;
        }
        vars[stack] += 1;
        while ( stack < length - 1 ) {
            stack += 1;
            vars[stack] = 0;
        }
        const permutation = [];
        for ( let i = 0; i < length; ++i ) {
            permutation[i] = i;
        }
        for ( let i = 0; i < length; ++i ) {
            const pick = vars[i];
            if ( pick !== 0 ) {
                permutation.splice( i, 0, permutation.splice( pick + i, 1 )[0] );
            }
        }
        result.push( permutation );
    }
}

function testAll( program, length, onDone ) {
    const permutations = getPermutations(length);
    let max = 0;
    let bestPermutation = null;

    const doStep = () => {
        if ( permutations.length ) {
            const settings = permutations.shift();
            //console.log( "Testing", settings );
            runTest( program, settings, result => {
                if ( result > max ) {
                    max = result;
                    bestPermutation = settings;
                }
                setTimeout(doStep, 0);
            })
        } else {
            console.log( "Best performance: ", max );
            console.log( bestPermutation );
            onDone();
        }
    }

    doStep();
}

rl.question( "Input program: ", answer => {


    testAll( answer, 5, () => rl.close() );
} );