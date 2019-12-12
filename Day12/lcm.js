const gcd = require( "./gcd" );

function lcm( items ) {
    const working = items.slice();
    let first = working.shift();
    while ( working.length ) {
        let second = working.shift();
        let cd = gcd( first, second );
        first = ( first / cd ) * second;
    }
    return first;
}

module.exports = lcm;