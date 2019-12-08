const readline = require( "readline" );

const rl = readline.createInterface( {
    input: process.stdin,
    output: process.stdout
} );

function isValid( password ) {
    let hasDouble = false;
    password = "" + password;

    if ( password.length !== 6 ) {
        return false;
    }

    for ( let i = 1; i <= 6; ++i ) {
        const prev = password[i - 1];
        const current = password[i];
        const next = password[i + 1];
        if ( prev === current && password[i - 2] !== current && next !== current  ) {
            hasDouble = true;
        } else if ( prev > current ) {
            return false;
        }
    }

    return hasDouble;
}


console.log( isValid( "112233" ) );
console.log( isValid( "123444" ) );
console.log( isValid( "111122" ) );

rl.question( "Enter range: ", answer => {
    const range = answer.split( "-", 2 );
    const from = +range[0];
    const to = +range[1];

    let passwords = 0;
    for ( let i = from; i <= to; ++i ) {
        if ( isValid( i ) )++passwords;
    }
    console.log( `Found ${passwords} passwords` );
    rl.close();
} );