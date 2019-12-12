const cache = {};
function gdc( a, b ) {
    const key = a + "_" + b;
    let result = cache[key];
    if ( result !== undefined ) return result;

    let keys = [];
    const saveCache = ( result ) => keys.forEach( key => cache[key] = result );
    while ( true ) {
        if ( a === 0 ) {
            saveCache( b );
            return b;
        }
        if ( b === 0 ) {
            saveCache( a );
            return a;
        }

        keys.push( a + "_" + b );

        const temp = a % b;
        a = b;
        b = temp;
    }
}

module.exports = gdc;