const fs = require( "fs" );
let filename = "puzzle.txt";

const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const content = fs.readFileSync( filename, { encoding: "utf8" } );

const NEW = "NEW";
const INCREMENT = "INCREMENT";
const CUT = "CUT";

function parse( content ) {
    const parts = content.replace( /\r/g, "" ).split( "\n" ).filter( p => !!p ).map( p => p.trim() );
    const cards = +parts[0];
    const ops = [];
    let result = null;
    parts.shift();
    parts.forEach( line => {
        if ( line.startsWith( "Result:" ) ) {
            result = line.substring( 7 ).trim().split( " " ).map( p => +p );
        } else if ( line.startsWith( "cut" ) ) {
            ops.push( {
                op: CUT,
                param: +line.substring( 4 )
            })
        } else if ( line.startsWith( "deal with increment" ) ) {
            ops.push( {
                op: INCREMENT,
                param: +line.substring( 20 )
            })
        } else if ( line === "deal into new stack" ) {
            ops.push( {
                op: NEW
            })
        } else {
            console.log( "Unknown instruction: ", line );
        }
    } );
    return {
        cards,
        ops,
        result
    }
}

function getDeck( cards ) {
    return [...Array( cards ).keys()].map( val => BigInt(val));
}

function dealNew( deck ) {
    return deck.reverse();
}

function dealWithIncrement( deck, increment ) {
    const result = [];
    let pos = 0;
    if ( increment <= 0 ) throw new Error( "Invalid increment" );
    for ( i = 0; i < deck.length; ++i ) {
        if ( result[pos] !== undefined ) throw new Error( `Invalid increment ${increment}` );
        result[pos] = deck[i];
        pos = ( pos + increment ) % deck.length;
    }
    return result;
}

function cut( deck, by ) {
    if ( by < 0 ) {
        return [...deck.slice( deck.length + by ), ...deck.slice( 0, deck.length + by )];
    } else {
        return [...deck.slice( by ), ...deck.slice( 0, by )];
    }
}

function runShuffle( deck, ops ) {
    ops.forEach( entry => {
        switch ( entry.op ) {
            case NEW:
                deck = dealNew( deck );
                break;
            case INCREMENT:
                deck = dealWithIncrement( deck, entry.param );
                break;
            case CUT:
                deck = cut( deck, entry.param );
                break;
        }
    } )
    return deck;
}

function compare( deck, expectation ) {
    if ( !expectation ) {
        console.log( "Expected result not known" );
        return;
    }
    for ( let i = 0; i < deck.length; ++i ) {
        if ( deck[i] !== expectation[i] ) {
            console.log( `Mismatch at position ${i}, got ${deck[i]} but expected ${expectation[i]}` );
            return;
        }
    }
    console.log( "Deck matches" );
}

function evalShuffle( ops, length ) {
    let mult = 1n;
    let abs = 0n;
    for ( let i = 0; i < ops.length; ++i ) {
        const entry = ops[i];
        switch ( entry.op ) {
            case NEW:
                // x1 = -1 * x0 - 1
                mult *= -1n;
                abs = -1n * abs - 1n;
                break;
            case CUT:
                // x1 = x0 - cut;
                abs -= BigInt( entry.param );
                break;
            case INCREMENT:
                // x1 = x0 * increment;
                mult *= BigInt( entry.param );
                abs *= BigInt( entry.param );
                break;
        }
        abs = ( abs + length ) % length;
        mult = ( mult + length ) % length;
        // console.log( `${entry.op} ${entry.param} : ${mult} * x + ${abs}` );
    }
    return {
        abs,
        mult
    }
}

const gcdCache = {};
function gcdExtended( a, b )
{    
    if ( a === 0n ) { 
        return {
            x: 0n,
            y: 1n,
            gcd: b
        }
    }

    const key = `${a}_${b}`;
    if ( gcdCache[key] ) return gcdCache[key];

    const { gcd, x, y } = gcdExtended( b % a, a );

    return gcdCache[key] = {
        x: y - ( b / a ) * x,
        y: x,
        gcd
    }
} 

function modInverse( b, m ) {
    const { gcd, x } = gcdExtended( b, m );
    if ( gcd != 1 ) {
        return -1;
    }
    return ( x % m + m ) % m;
}

function modDivide( a, b, m ) {
    a = a % m;
    b = b % m;
    inv = modInverse( b, m );
    if ( inv === -1 ) throw new Error( "Cannot divide" );
    return ( inv * a ) % m;
}

function solveFor( position, mult, abs, length ) {
    // mult * x + abs = position
    let target = position - abs;
    let result = modDivide( target + length, mult, length );
    return result;
}

function repeatFunction( mult, abs, repeat, length ) {
    if ( repeat === 1n ) {
        return { mult, abs };
    }
    let { abs: abs2, mult: mult2 } = repeatFunction( mult, abs, repeat / 2n, length );
    const prevMult2 = mult2;
    mult2 = ( mult2 * mult2 ) % length;
    abs2 = ( prevMult2 * abs2 + abs2 ) % length;
    if ( repeat % 2n === 1n ) {
        mult2 = ( mult * mult2 ) % length;
        abs2 = ( mult * abs2 + abs ) % length;
    }
    return {
        mult: mult2,
        abs: abs2
    };
}

let { cards, ops, result } = parse( content );
console.log( ops );
if ( false ) {
    console.log( "Expected: ", result );
    console.log( "Number of cards: ", cards );
    cards = BigInt( cards );
    let { abs, mult } = evalShuffle( ops, cards );
    console.log( `Result: ${mult} * x + ${abs}` );
    let deck = getDeck( Number(cards) );
//    const repeat = 1232312323;
    const repeat = 213n;
    for ( let i = 0n; i < repeat; ++i ) {
        deck = runShuffle( deck, ops );
    }    
    console.log( deck );
    const deck2 = [];
    //console.log( repeatFn( mult, abs, repeat, cards ) );
    //console.log( repeatFn2( mult, abs, repeat, cards ) );
    let { abs:abs2, mult:mult2 } = repeatFunction( mult, abs, repeat, cards );
    console.log( `Result repeated ${repeat}x: ${mult2} * x + ${abs2}` );
    for ( let i = 0; i < deck.length; ++i ) {
        deck2[i] = solveFor( BigInt(i), mult2, abs2, cards );
    }
    console.log( deck2 );
    compare( deck, deck2 );

} else {
    cards = 119315717514047n;
    let repeat = 101741582076661n;
    let { abs, mult } = evalShuffle( ops, cards );
    let { abs: abs2, mult: mult2 } = repeatFunction( mult, abs, repeat, cards );
    //let { abs: abs2, mult: mult2 } = repeatFn( mult, abs, loops, cards );
    console.log( `Result repeated ${repeat}x: ${mult2} * x + ${abs2}` );
    const startPos = 2020n;
    console.log( `Card at position ${startPos} is ${solveFor( startPos, mult2, abs2, cards )}`);
}