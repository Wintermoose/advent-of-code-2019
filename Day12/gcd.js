const cache = {};
function gdc( a, b ) {
    if ( a === 0 ) return b;
    if ( b === 0 ) return a;
    const key = a + "_" + b;
    let result = cache[key];
    if ( result === undefined ) {
        result = gdc( b, a % b );
        cache[key] = result;
    }
    return result;
}

module.exports = gdc;