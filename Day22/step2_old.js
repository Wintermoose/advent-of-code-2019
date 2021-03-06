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
    return [...Array( cards ).keys()];
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

const posCache = {};
function trackPosition( ops, length, position ) {
    if ( posCache[position] ) return posCache[position];
    const key = position;
    for ( let i = ops.length - 1; i >= 0; --i ) {
        const entry = ops[i];
        switch ( entry.op ) {
            case NEW:
                position = length - position - 1;
                break;
            case CUT:
                if ( entry.param > 0 ) {
                    if ( position >= length - entry.param ) {
                        position = position - ( length - entry.param );
                    } else {
                        position += entry.param;
                    }
                } else {
                    if ( position < -entry.param ) {
                        position = position + ( length + entry.param );
                    } else {
                        position -= -entry.param;
                    }
                }
                break;
            case INCREMENT:
                position = modDivide( position, entry.param, length );
                break;
        }
    }
    return posCache[key] = position;
}

const gcdCache = {};
function gcdExtended( a, b )
{    
    if ( a === 0 ) { 
        return {
            x: 0,
            y: 1,
            gcd: b
        }
    }

    const key = `${a}_${b}`;
    if ( gcdCache[key] ) return gcdCache[key];

    const { gcd, x, y } = gcdExtended( b % a, a );

    return gcdCache[key] = {
        x: y - Math.floor( b / a ) * x,
        y: x,
        gcd
    }
} 

function modInverse( b, m ) {
    const { gcd, x } = gcdExtended( b, m );
    if ( gcd != 1 ) return -1;
    return ( x % m + m ) % m;
}

function modDivide( a, b, m ) {
    a = a % m;
    inv = modInverse( b, m );
    if ( inv === -1 ) throw new Error( "Cannot divide" );
    return ( inv * a ) % m;
}

let { cards, ops, result } = parse( content );
console.log( ops );
console.log( result );
console.log( cards );
if ( false ) {
    const pos = 3;
    console.log( `Card at position ${pos} is ${trackPosition( ops.slice(), cards, pos )}` );
    let deck = getDeck( cards );
    deck = runShuffle( deck, ops );
    //console.log( deck );
    console.log( deck[pos] );
    compare( deck, result );
    console.log( `Position of card 2019 is ${deck.indexOf( 2019 )}` );

} else {
    cards = 119315717514047;
    let loops = 101741582076661;
    const startPos = 2020;
    let position = startPos;
    while ( loops-- ) {
        if ( loops % 100000 === 0 ) console.log( loops );
        position = trackPosition( ops, cards, position );
        if ( position === startPos ) {
            console.log( "Back in the beginning" )
            console.log( loops );
            break;
        }
    }
    console.log( `Card at position ${startPos} is ${position}` );

}