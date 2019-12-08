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
        if ( password[i - 1] === password[i] ) {
            hasDouble = true;
        } else if ( password[i - 1] > password[i] ) {
            return false;
        }
    }

    return hasDouble;
}


console.log( isValid( "111111" ) );
console.log( isValid( "223450" ) );
console.log( isValid( "123789" ) );

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